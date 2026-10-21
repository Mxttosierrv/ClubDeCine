import { useCallback, useEffect, useRef, useState } from "react";
import type { Movie } from "@/models/Movie";
import { movieRepository } from "@/services/container";

/** Búsqueda inicial cuando el usuario aún no escribe nada (OMDb exige un término). */
export const DEFAULT_QUERY = "the";

export type SearchStatus = "loading" | "ready" | "error";

interface SearchState {
  movies: Movie[];
  status: SearchStatus;
  loadingMore: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
}

const INITIAL_STATE: SearchState = {
  movies: [],
  status: "loading",
  loadingMore: false,
  error: null,
  page: 0,
  total: 0,
  hasMore: false,
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

/**
 * Busca películas por título con paginación. Ignora respuestas de búsquedas
 * anteriores que lleguen tarde para que nunca se mezclen resultados.
 */
export function useMovieSearch(rawQuery: string) {
  const query = rawQuery.trim() || DEFAULT_QUERY;
  const [state, setState] = useState<SearchState>(INITIAL_STATE);
  const requestId = useRef(0);

  const fetchPage = useCallback(async (page: number, current: Movie[]) => {
    const id = ++requestId.current;
    console.log("[search] inicio", { query, page, id });
    try {
      const result = await movieRepository.searchMovies(query, page);
      console.log("[search] ok", { id, vigente: requestId.current, peliculas: result.movies.length, total: result.total });
      if (id !== requestId.current) return;

      const known = new Set(current.map((movie) => movie.id));
      const fresh = result.movies.filter((movie) => !known.has(movie.id));
      setState({
        movies: [...current, ...fresh],
        status: "ready",
        loadingMore: false,
        error: null,
        page,
        total: result.total,
        hasMore: result.hasMore,
      });
    } catch (error) {
      console.log("[search] error", { id, vigente: requestId.current, error: String(error) });
      if (id !== requestId.current) return;
      setState((prev) => ({
        ...prev,
        movies: current,
        status: current.length > 0 ? "ready" : "error",
        loadingMore: false,
        error: messageOf(error),
      }));
    }
  }, [query]);

  // Nueva búsqueda cuando cambia el término.
  useEffect(() => {
    setState(INITIAL_STATE);
    void fetchPage(1, []);
    return () => {
      // Invalida cualquier petición en vuelo de este término.
      requestId.current++;
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (state.status !== "ready" || state.loadingMore || !state.hasMore) return;
    setState((prev) => ({ ...prev, loadingMore: true, error: null }));
    void fetchPage(state.page + 1, state.movies);
  }, [state, fetchPage]);

  const retry = useCallback(() => {
    setState(INITIAL_STATE);
    void fetchPage(1, []);
  }, [fetchPage]);

  return { ...state, loadMore, retry };
}
