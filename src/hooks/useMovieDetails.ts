import { useEffect, useState } from "react";
import type { Movie } from "@/models/Movie";
import { movieRepository } from "@/services/container";

interface Settled {
  id: string;
  /** Ficha completa, o null si no se pudo cargar. */
  movie: Movie | null;
}

/**
 * Completa una película de un listado con su ficha de TMDB (duración, director
 * y reparto, que los listados no traen). Mientras carga devuelve la película
 * original; si la carga falla, se queda con ella.
 */
export function useMovieDetails(movie: Movie | null): { movie: Movie | null; loading: boolean } {
  const id = movie?.id ?? null;
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    if (id === null) return;
    let active = true;
    movieRepository
      .getDetails(id)
      .then((full) => {
        if (active) setSettled({ id, movie: full });
      })
      .catch(() => {
        if (active) setSettled({ id, movie: null });
      });
    return () => {
      active = false;
    };
  }, [id]);

  const ready = id !== null && settled?.id === id;
  return {
    movie: ready && settled.movie ? settled.movie : movie,
    loading: id !== null && !ready,
  };
}
