import { useCallback, useEffect, useRef, useState } from "react";
import type { Movie } from "@/models/Movie";
import type { BrowseSort, MoviePage } from "@/services/MovieRepository";
import { movieRepository } from "@/services/container";

export type CatalogStatus = "loading" | "ready" | "error";

interface CatalogState {
  movies: Movie[];
  status: CatalogStatus;
  loadingMore: boolean;
  error: string | null;
  total: number;
  /** Número de la próxima página; null cuando ya no hay más. */
  nextPage: number | null;
}

interface CatalogParams {
  /** Texto de búsqueda; vacío = explorar el catálogo (populares por defecto). */
  query: string;
  sort: BrowseSort;
  year: number | null;
  genreId: number | null;
  /** Puntuación mínima de TMDB (0–10). */
  minRating: number | null;
}

const INITIAL_STATE: CatalogState = {
  movies: [],
  status: "loading",
  loadingMore: false,
  error: null,
  total: 0,
  nextPage: null,
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

/**
 * Carga películas de TMDB con paginación: explora el catálogo (las más
 * populares o mejor valoradas, con filtros de año, género y nota mínima) o
 * busca por título. Ignora respuestas de consultas anteriores que lleguen
 * tarde, para que nunca se mezclen resultados.
 */
export function useMovieCatalog(params: CatalogParams) {
  const query = params.query.trim();
  // En una búsqueda los filtros no se envían al servidor (la API de búsqueda no
  // los admite): no deben provocar nuevas consultas; la pantalla los aplica localmente.
  const searching = query !== "";
  const sort = searching ? "popular" : params.sort;
  const year = searching ? null : params.year;
  const genreId = searching ? null : params.genreId;
  const minRating = searching ? null : params.minRating;

  const [state, setState] = useState<CatalogState>(INITIAL_STATE);
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (page: number, current: Movie[]) => {
      const id = ++requestId.current;
      try {
        const result: MoviePage = searching
          ? await movieRepository.search(query, page)
          : await movieRepository.browse({ sort, year, genreId, minRating }, page);
        if (id !== requestId.current) return;

        const known = new Set(current.map((movie) => movie.id));
        const fresh = result.movies.filter((movie) => !known.has(movie.id));
        setState({
          movies: [...current, ...fresh],
          status: "ready",
          loadingMore: false,
          error: null,
          total: result.total,
          nextPage: result.nextPage,
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setState((prev) => ({
          ...prev,
          movies: current,
          status: current.length > 0 ? "ready" : "error",
          loadingMore: false,
          error: messageOf(error),
        }));
      }
    },
    [searching, query, sort, year, genreId, minRating],
  );

  // Nueva consulta cuando cambia la búsqueda o alguno de los filtros del servidor.
  useEffect(() => {
    setState(INITIAL_STATE);
    void fetchPage(1, []);
    return () => {
      // Invalida cualquier petición en vuelo de la consulta anterior.
      requestId.current++;
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.status !== "ready" || state.loadingMore || state.nextPage === null) return;
    setState((prev) => ({ ...prev, loadingMore: true, error: null }));
    void fetchPage(state.nextPage, state.movies);
  }, [state, fetchPage]);

  const retry = useCallback(() => {
    setState(INITIAL_STATE);
    void fetchPage(1, []);
  }, [fetchPage]);

  return { ...state, hasMore: state.nextPage !== null, searching, loadMore, retry };
}
