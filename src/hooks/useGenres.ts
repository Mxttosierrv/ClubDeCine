import { useCallback, useEffect, useState } from "react";
import type { Genre } from "@/models/Genre";
import { movieRepository } from "@/services/container";

export type GenresStatus = "loading" | "ready" | "error";

/**
 * Géneros de TMDB para el filtro. Si la carga falla no es crítico: el filtro de
 * género muestra el problema y permite reintentar, y el resto de la pantalla sigue.
 */
export function useGenres(): { genres: Genre[]; status: GenresStatus; retry: () => void } {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [status, setStatus] = useState<GenresStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    movieRepository
      .getGenres()
      .then((list) => {
        if (!active) return;
        setGenres(list);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { genres, status, retry };
}
