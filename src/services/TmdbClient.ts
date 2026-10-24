import type { TmdbSort } from "@/models/SortOption";

export type TmdbErrorKind =
  | "config"
  | "network"
  | "unauthorized"
  | "rate_limit"
  | "not_found"
  | "api";

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly kind: TmdbErrorKind,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export interface DiscoverParams {
  /** Valor de `sort_by` de /discover/movie. */
  sortBy: TmdbSort;
  page: number;
  /** Ids de género ya unidos: "28,12" = todos los géneros (AND), "28|12" = alguno (OR). */
  withGenres?: string;
  year?: number;
  /** Puntuación mínima (0–10). */
  minRating?: number;
  /** Votos mínimos, para que una nota alta con 1 voto no domine la lista. */
  minVotes?: number;
  /** Solo películas estrenadas hasta esta fecha ("AAAA-MM-DD"), para excluir las no estrenadas. */
  releaseUntil?: string;
}

/** Página sin interpretar: los elementos se convierten a `Movie` en el mapper. */
export interface RawPage {
  items: unknown[];
  page: number;
  totalPages: number;
  totalResults: number;
}

const DEFAULT_BASE_URL = "https://api.themoviedb.org/3";

/** Idioma de títulos y sinopsis. */
export const TMDB_LANGUAGE = "es-MX";

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function count(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Cliente HTTP de bajo nivel para la API v3 de TMDB. No conoce el modelo de
 * dominio. Autentica con el "token de acceso de lectura" (Bearer).
 */
export class TmdbClient {
  constructor(
    private readonly accessToken: string,
    private readonly baseUrl: string = DEFAULT_BASE_URL,
  ) {}

  /** Explorar películas con orden y filtros (por defecto, las más populares). */
  discover(params: DiscoverParams): Promise<RawPage> {
    const query: Record<string, string> = {
      language: TMDB_LANGUAGE,
      sort_by: params.sortBy,
      include_adult: "false",
      include_video: "false",
      page: String(params.page),
    };
    if (params.withGenres) query.with_genres = params.withGenres;
    if (params.year !== undefined) query.primary_release_year = String(params.year);
    if (params.releaseUntil) query["primary_release_date.lte"] = params.releaseUntil;
    if (params.minRating !== undefined) query["vote_average.gte"] = String(params.minRating);
    if (params.minVotes !== undefined) query["vote_count.gte"] = String(params.minVotes);

    return this.getPage("/discover/movie", query);
  }

  /** Buscar películas por título. */
  search(term: string, page: number): Promise<RawPage> {
    return this.getPage("/search/movie", {
      query: term,
      language: TMDB_LANGUAGE,
      include_adult: "false",
      page: String(page),
    });
  }

  /** Lista completa de géneros de películas. */
  async genres(): Promise<unknown[]> {
    const body = await this.get("/genre/movie/list", { language: TMDB_LANGUAGE });
    const list = record(body)?.genres;
    if (!Array.isArray(list)) throw this.formatError();
    return list;
  }

  /** Ficha completa de una película, con reparto y equipo. */
  details(id: string): Promise<unknown> {
    if (!/^\d+$/.test(id)) {
      return Promise.reject(new TmdbError("Película no encontrada.", "not_found"));
    }
    return this.get(`/movie/${id}`, { language: TMDB_LANGUAGE, append_to_response: "credits" });
  }

  private async getPage(path: string, params: Record<string, string>): Promise<RawPage> {
    const data = record(await this.get(path, params));
    if (!data || !Array.isArray(data.results)) throw this.formatError();

    return {
      items: data.results,
      page: count(data.page, 1),
      totalPages: count(data.total_pages, 1),
      totalResults: count(data.total_results, data.results.length),
    };
  }

  private async get(path: string, params: Record<string, string>): Promise<unknown> {
    if (!this.accessToken) {
      throw new TmdbError(
        "Falta el token de TMDB. Copia .env.example a .env y pega tu token de acceso de lectura.",
        "config",
      );
    }

    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}?${query}`, {
        headers: { Authorization: `Bearer ${this.accessToken}`, Accept: "application/json" },
      });
    } catch {
      throw new TmdbError("No se pudo conectar con TMDB. Revisa tu conexión a internet.", "network");
    }

    if (response.status === 401) {
      throw new TmdbError("El token de TMDB no es válido. Revisa tu archivo .env.", "unauthorized");
    }
    if (response.status === 404) {
      throw new TmdbError("TMDB no encontró lo que se pidió.", "not_found");
    }
    if (response.status === 429) {
      throw new TmdbError(
        "TMDB recibió demasiadas consultas. Espera un momento e intenta de nuevo.",
        "rate_limit",
      );
    }
    if (!response.ok) {
      throw new TmdbError(`TMDB respondió con error (${response.status}).`, "api");
    }

    try {
      return await response.json();
    } catch {
      throw new TmdbError("La respuesta de TMDB no es válida.", "api");
    }
  }

  private formatError(): TmdbError {
    return new TmdbError("TMDB respondió con un formato inesperado.", "api");
  }
}
