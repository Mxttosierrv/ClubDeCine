import { useEffect, useState } from "react";
import type { Genre } from "@/models/Genre";
import { movieRepository } from "@/services/container";

/**
 * Géneros de TMDB para los filtros. Si la carga falla devuelve una lista vacía
 * (la pantalla simplemente no muestra ese filtro); no es un error crítico.
 */
export function useGenres(): Genre[] {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    let active = true;
    movieRepository
      .getGenres()
      .then((list) => {
        if (active) setGenres(list);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return genres;
}
