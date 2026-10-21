import type { OmdbMovieDto, OmdbSearchItem, OmdbSearchResponse } from "./omdbTypes";

export type OmdbErrorKind = "config" | "network" | "api";

export class OmdbError extends Error {
  constructor(
    message: string,
    readonly kind: OmdbErrorKind,
  ) {
    super(message);
    this.name = "OmdbError";
  }
}

export interface OmdbSearchPage {
  items: OmdbSearchItem[];
  total: number;
}

/** Mensajes de la API traducidos para mostrarlos al usuario. */
const API_MESSAGES: Record<string, string> = {
  "Invalid API key!": "La API key de OMDb no es válida. Revisa tu archivo .env.",
  "No API key provided.": "Falta la API key de OMDb. Revisa tu archivo .env.",
  "Request limit reached!": "Se alcanzó el límite diario de la API de OMDb. Intenta mañana.",
  "Too many results.": "Demasiados resultados. Escribe un título más específico.",
};

/** Cliente HTTP de bajo nivel para OMDb. No conoce el modelo de dominio. */
export class OmdbClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = "https://www.omdbapi.com/",
  ) {}

  /** Busca películas por título. Devuelve una página (10 resultados como máximo). */
  async search(query: string, page: number): Promise<OmdbSearchPage> {
    const data = await this.request<OmdbSearchResponse>({
      s: query,
      type: "movie",
      page: String(page),
    });

    if (data.Response === "False") {
      if (data.Error === "Movie not found!") return { items: [], total: 0 };
      throw this.apiError(data.Error);
    }

    const items = data.Search ?? [];
    const total = Number.parseInt(data.totalResults ?? "", 10);
    return { items, total: Number.isNaN(total) ? items.length : total };
  }

  /** Obtiene la ficha completa (incluye Metascore) de una película por su id de IMDb. */
  async getById(imdbId: string): Promise<OmdbMovieDto> {
    const data = await this.request<OmdbMovieDto>({ i: imdbId, plot: "short" });
    if (data.Response === "False") throw this.apiError(data.Error);
    return data;
  }

  private async request<T>(params: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new OmdbError(
        "Falta la API key de OMDb. Copia .env.example a .env y agrega tu clave.",
        "config",
      );
    }

    const query = Object.entries({ apikey: this.apiKey, ...params })
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}?${query}`);
    } catch {
      throw new OmdbError("No se pudo conectar. Revisa tu conexión a internet.", "network");
    }

    if (response.status === 401) {
      throw new OmdbError(API_MESSAGES["Invalid API key!"], "api");
    }
    if (!response.ok) {
      throw new OmdbError(`El servicio respondió con error (${response.status}).`, "network");
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new OmdbError("La respuesta del servicio no es válida.", "api");
    }
  }

  private apiError(message: string | undefined): OmdbError {
    const text = message ? (API_MESSAGES[message] ?? message) : "Error desconocido de la API.";
    return new OmdbError(text, "api");
  }
}
