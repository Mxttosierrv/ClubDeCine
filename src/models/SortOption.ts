import type { Movie } from "./Movie";

export type SortKey =
  | "popular"
  | "title-asc"
  | "title-desc"
  | "rating-desc"
  | "rating-asc"
  | "release-desc"
  | "release-asc";

/** Valores de `sort_by` de /discover/movie que usa la app. */
export type TmdbSort =
  | "popularity.desc"
  | "vote_average.desc"
  | "vote_average.asc"
  | "primary_release_date.desc"
  | "primary_release_date.asc";

export interface SortOption {
  key: SortKey;
  /** Encabezado del menú bajo el que se agrupa; null = opción base, sin encabezado. */
  section: string | null;
  /** Texto de la opción dentro del menú. */
  label: string;
  /** Texto corto para el botón del filtro y para la etiqueta de filtro activo. */
  summary: string;
  /** Orden que se pide al servidor al explorar el catálogo. */
  tmdbSort: TmdbSort;
  /**
   * true si el servidor no puede ordenar así (TMDB no ordena por el título
   * traducido que se muestra): se ordenan en el dispositivo las películas ya cargadas.
   */
  localOnly: boolean;
  /** Votos mínimos para que el orden tenga sentido (evita títulos con 1 voto). */
  minVotes: number;
  /** Excluye películas aún sin estrenar (por ejemplo, al ordenar por fecha). */
  untilToday: boolean;
}

const BY_KEY: Record<SortKey, SortOption> = {
  popular: {
    key: "popular",
    section: null,
    label: "Más populares",
    summary: "Más populares",
    tmdbSort: "popularity.desc",
    localOnly: false,
    minVotes: 0,
    untilToday: false,
  },
  "title-asc": {
    key: "title-asc",
    section: "Nombre",
    label: "A–Z · ascendente",
    summary: "Nombre A–Z",
    tmdbSort: "popularity.desc",
    localOnly: true,
    minVotes: 0,
    untilToday: false,
  },
  "title-desc": {
    key: "title-desc",
    section: "Nombre",
    label: "Z–A · descendente",
    summary: "Nombre Z–A",
    tmdbSort: "popularity.desc",
    localOnly: true,
    minVotes: 0,
    untilToday: false,
  },
  "rating-desc": {
    key: "rating-desc",
    section: "Valoración",
    label: "Mayor a menor · descendente",
    summary: "Mejor valoradas",
    tmdbSort: "vote_average.desc",
    localOnly: false,
    minVotes: 200,
    untilToday: false,
  },
  "rating-asc": {
    key: "rating-asc",
    section: "Valoración",
    label: "Menor a mayor · ascendente",
    summary: "Peor valoradas",
    tmdbSort: "vote_average.asc",
    localOnly: false,
    minVotes: 200,
    untilToday: false,
  },
  "release-desc": {
    key: "release-desc",
    section: "Fecha de estreno",
    label: "Más recientes · descendente",
    summary: "Más recientes",
    tmdbSort: "primary_release_date.desc",
    localOnly: false,
    minVotes: 20,
    untilToday: true,
  },
  "release-asc": {
    key: "release-asc",
    section: "Fecha de estreno",
    label: "Más antiguas · ascendente",
    summary: "Más antiguas",
    tmdbSort: "primary_release_date.asc",
    localOnly: false,
    minVotes: 100,
    untilToday: true,
  },
};

/** Opciones en el orden en que se muestran en el menú. */
export const SORT_OPTIONS: readonly SortOption[] = [
  BY_KEY.popular,
  BY_KEY["title-asc"],
  BY_KEY["title-desc"],
  BY_KEY["rating-desc"],
  BY_KEY["rating-asc"],
  BY_KEY["release-desc"],
  BY_KEY["release-asc"],
];

/** Orden base: lo más popular, tal como lo entrega TMDB. */
export const DEFAULT_SORT: SortKey = "popular";

export function sortOptionOf(key: SortKey): SortOption {
  return BY_KEY[key];
}

type Direction = "asc" | "desc";

/** Los datos que faltan (sin nota o sin fecha) van siempre al final, en cualquier dirección. */
function compareNullable(a: number | string | null, b: number | string | null, dir: Direction): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (a === b) return 0;
  const order = a < b ? -1 : 1;
  return dir === "asc" ? order : -order;
}

/** Alfabético en español, sin distinguir tildes ni mayúsculas, con números en orden natural. */
function compareTitles(a: string, b: string): number {
  return a.localeCompare(b, "es", { sensitivity: "base", numeric: true });
}

/** Comparador para ordenar en el dispositivo; null = conservar el orden recibido. */
export function movieComparator(key: SortKey): ((a: Movie, b: Movie) => number) | null {
  switch (key) {
    case "popular":
      return null;
    case "title-asc":
      return (a, b) => compareTitles(a.title, b.title);
    case "title-desc":
      return (a, b) => compareTitles(b.title, a.title);
    case "rating-desc":
      return (a, b) => compareNullable(a.rating, b.rating, "desc");
    case "rating-asc":
      return (a, b) => compareNullable(a.rating, b.rating, "asc");
    case "release-desc":
      return (a, b) => compareNullable(a.releaseDate, b.releaseDate, "desc");
    case "release-asc":
      return (a, b) => compareNullable(a.releaseDate, b.releaseDate, "asc");
  }
}
