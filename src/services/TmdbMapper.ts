import type { Genre } from "@/models/Genre";
import { Movie } from "@/models/Movie";

type Json = Record<string, unknown>;

/** Base de las imágenes de TMDB; el tamaño (w500, w780…) se agrega después. */
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function record(value: unknown): Json | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : null;
}

/** TMDB usa cadenas vacías para lo que no tiene: se vuelven null. */
function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean.length > 0 ? clean : null;
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function image(path: unknown, size: string): string | null {
  const clean = text(path);
  return clean ? `${IMAGE_BASE}/${size}${clean}` : null;
}

/** Los géneros llegan como `genres: [{id, name}]` (ficha) o `genre_ids: [id]` (listados). */
function genreNames(item: Json, names: ReadonlyMap<number, string>): string[] {
  if (Array.isArray(item.genres)) {
    return item.genres
      .map((genre) => text(record(genre)?.name))
      .filter((name): name is string => name !== null);
  }
  if (Array.isArray(item.genre_ids)) {
    return item.genre_ids
      .map((id) => (typeof id === "number" ? names.get(id) : undefined))
      .filter((name): name is string => name !== undefined);
  }
  return [];
}

/** Director y reparto salen de `credits` (solo en la ficha completa). */
function credits(item: Json): { director: string | null; cast: string[] } {
  const data = record(item.credits);
  if (!data) return { director: null, cast: [] };

  const crew = Array.isArray(data.crew) ? data.crew : [];
  const director = crew
    .map((member) => record(member))
    .find((member) => member?.job === "Director");

  const cast = (Array.isArray(data.cast) ? data.cast : [])
    .slice(0, 5)
    .map((member) => text(record(member)?.name))
    .filter((name): name is string => name !== null);

  return { director: text(director?.name), cast };
}

/** Traduce las respuestas crudas de TMDB al modelo de dominio. */
export class TmdbMapper {
  /** Devuelve null si el elemento no tiene lo mínimo (id y título) para mostrarse. */
  static toMovie(raw: unknown, names: ReadonlyMap<number, string>): Movie | null {
    const item = record(raw);
    if (!item) return null;

    const id = numeric(item.id);
    const title = text(item.title) ?? text(item.original_title);
    if (id === null || title === null) return null;

    const releaseDate = text(item.release_date);
    const year = releaseDate ? numeric(Number(releaseDate.slice(0, 4))) : null;

    // Sin votos, TMDB informa 0: eso significa "sin puntuación", no una nota de cero.
    const voteCount = numeric(item.vote_count);
    const average = numeric(item.vote_average);
    const rating = average !== null && voteCount !== null && voteCount > 0 ? average : null;

    const { director, cast } = credits(item);
    const runtime = numeric(item.runtime);

    return new Movie({
      id: String(id),
      title,
      year,
      releaseDate,
      genres: genreNames(item, names),
      rating,
      voteCount,
      poster: image(item.poster_path, "w500"),
      backdrop: image(item.backdrop_path, "w780"),
      description: text(item.overview),
      runtime: runtime !== null && runtime > 0 ? runtime : null,
      director,
      cast,
    });
  }

  static toGenres(raw: unknown[]): Genre[] {
    return raw
      .map((item) => record(item))
      .map((item): Genre | null => {
        const id = numeric(item?.id);
        const name = text(item?.name);
        return id === null || name === null ? null : { id, name };
      })
      .filter((genre): genre is Genre => genre !== null);
  }
}
