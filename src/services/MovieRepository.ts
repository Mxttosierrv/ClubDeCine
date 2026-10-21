import { Movie } from "@/models/Movie";
import { OmdbClient } from "./OmdbClient";
import { OmdbMapper } from "./OmdbMapper";

export interface MoviePage {
  movies: Movie[];
  total: number;
  hasMore: boolean;
}

/** OMDb devuelve 10 resultados por página y permite hasta 100 páginas. */
const PAGE_SIZE = 10;
const MAX_PAGES = 100;

/**
 * Punto de acceso a los datos de películas. Las pantallas dependen de esta
 * clase y no de OMDb, así que cambiar de proveedor (por ejemplo, la API
 * oficial de Metacritic) solo implica modificar este archivo y el cliente.
 */
export class MovieRepository {
  private readonly cache = new Map<string, Promise<Movie>>();

  constructor(private readonly client: OmdbClient) {}

  async searchMovies(query: string, page: number): Promise<MoviePage> {
    const { items, total } = await this.client.search(query, page);

    // Cada ficha trae el Metascore; si una falla, se omite sin romper la página.
    const results = await Promise.allSettled(items.map((item) => this.getMovie(item.imdbID)));
    const movies = results
      .filter((result): result is PromiseFulfilledResult<Movie> => result.status === "fulfilled")
      .map((result) => result.value);

    // Si fallaron TODAS (límite diario, key inválida, red), se informa el motivo
    // real en lugar de mostrar una lista vacía engañosa.
    if (items.length > 0 && movies.length === 0) {
      const failure = results.find(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      throw failure?.reason ?? new Error("No se pudieron cargar los detalles de las películas.");
    }

    return {
      movies,
      total,
      hasMore: page < MAX_PAGES && page * PAGE_SIZE < total,
    };
  }

  /** Ficha de una película; las consultas repetidas se sirven desde caché. */
  getMovie(id: string): Promise<Movie> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const request = this.client.getById(id).then((dto) => OmdbMapper.toMovie(dto));
    this.cache.set(id, request);
    // Si falla, no se cachea el error para poder reintentar.
    request.catch(() => this.cache.delete(id));
    return request;
  }
}