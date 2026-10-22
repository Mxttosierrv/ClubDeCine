import type { Genre } from "@/models/Genre";
import type { Movie } from "@/models/Movie";
import { TmdbClient, TmdbError, type RawPage } from "./TmdbClient";
import { TmdbMapper } from "./TmdbMapper";

/** Criterios de orden del catálogo (lo que el usuario elige en pantalla). */
export type BrowseSort = "popular" | "rating";

export interface BrowseQuery {
  sort: BrowseSort;
  /** Solo películas estrenadas ese año; null = todos los años. */
  year: number | null;
  /** Solo ese género; null = todos. */
  genreId: number | null;
  /** Puntuación mínima de TMDB (0–10); null = cualquiera. */
  minRating: number | null;
}

export interface MoviePage {
  movies: Movie[];
  total: number;
  /** Número de la siguiente página, o null si ya no hay más. */
  nextPage: number | null;
}

/** TMDB solo entrega hasta la página 500. */
const MAX_PAGE = 500;

/** Votos mínimos al ordenar por nota, para no listar títulos con 1 voto. */
const MIN_VOTES_FOR_RANKING = 300;
/** Votos mínimos al filtrar por nota mínima. */
const MIN_VOTES_FOR_FILTER = 50;

/**
 * Punto de acceso a los datos de películas. Las pantallas dependen de esta
 * clase y no de TMDB, así que cambiar de proveedor solo implica modificar
 * este archivo y el cliente.
 */
export class MovieRepository {
  private genreList: Promise<Genre[]> | null = null;
  private readonly details = new Map<string, Promise<Movie>>();

  constructor(private readonly client: TmdbClient) {}

  /** Catálogo ordenado y filtrado (por defecto, las más populares). */
  async browse(query: BrowseQuery, page: number): Promise<MoviePage> {
    const minVotes =
      query.sort === "rating"
        ? MIN_VOTES_FOR_RANKING
        : query.minRating !== null
          ? MIN_VOTES_FOR_FILTER
          : undefined;

    const [raw, names] = await Promise.all([
      this.client.discover({
        sortBy: query.sort === "rating" ? "vote_average.desc" : "popularity.desc",
        page,
        genreId: query.genreId ?? undefined,
        year: query.year ?? undefined,
        minRating: query.minRating ?? undefined,
        minVotes,
      }),
      this.genreNames(),
    ]);
    return this.toPage(raw, names);
  }

  /** Búsqueda por título. */
  async search(term: string, page: number): Promise<MoviePage> {
    const [raw, names] = await Promise.all([this.client.search(term, page), this.genreNames()]);
    return this.toPage(raw, names);
  }

  /** Lista de géneros (se pide una sola vez; si falla, se reintenta la próxima vez). */
  getGenres(): Promise<Genre[]> {
    if (!this.genreList) {
      const request = this.client.genres().then((raw) => TmdbMapper.toGenres(raw));
      this.genreList = request;
      request.catch(() => {
        if (this.genreList === request) this.genreList = null;
      });
    }
    return this.genreList;
  }

  /** Ficha completa (duración, director, reparto); las consultas repetidas salen de caché. */
  getDetails(id: string): Promise<Movie> {
    const cached = this.details.get(id);
    if (cached) return cached;

    const request = this.client.details(id).then((raw) => {
      const movie = TmdbMapper.toMovie(raw, new Map());
      if (!movie) throw new TmdbError("TMDB respondió con un formato inesperado.", "api");
      return movie;
    });
    this.details.set(id, request);
    // Si falla, no se cachea el error para poder reintentar.
    request.catch(() => this.details.delete(id));
    return request;
  }

  /** Los listados traen géneros como números; si la lista falla, se muestran sin género. */
  private async genreNames(): Promise<Map<number, string>> {
    try {
      const genres = await this.getGenres();
      return new Map(genres.map((genre) => [genre.id, genre.name]));
    } catch {
      return new Map();
    }
  }

  private toPage(raw: RawPage, names: ReadonlyMap<number, string>): MoviePage {
    const movies = raw.items
      .map((item) => TmdbMapper.toMovie(item, names))
      .filter((movie): movie is Movie => movie !== null);

    // Si llegaron datos pero ninguno se reconoce, el formato cambió: se avisa
    // en lugar de mostrar una lista vacía engañosa.
    if (raw.items.length > 0 && movies.length === 0) {
      throw new TmdbError("No se reconocieron los datos de TMDB.", "api");
    }

    const lastPage = Math.min(raw.totalPages, MAX_PAGE);
    return {
      movies,
      total: raw.totalResults,
      nextPage: raw.page < lastPage ? raw.page + 1 : null,
    };
  }
}
