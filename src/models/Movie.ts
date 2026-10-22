export type ScoreTier = "high" | "mixed" | "low" | "none";

/** Datos planos de una película (lo que se serializa a disco). */
export interface MovieProps {
  /** Identificador de TMDB, como texto (ej. "603"). */
  id: string;
  title: string;
  year: number | null;
  /** Fecha de estreno "AAAA-MM-DD". */
  releaseDate: string | null;
  genres: string[];
  /** Puntuación de usuarios de TMDB, 0–10. Es null si aún no tiene votos. */
  rating: number | null;
  /** Cantidad de votos detrás de la puntuación. */
  voteCount: number | null;
  poster: string | null;
  backdrop: string | null;
  /** Sinopsis (puede faltar si TMDB no la tiene traducida). */
  description: string | null;
  /** Solo en la ficha completa: duración en minutos. */
  runtime: number | null;
  /** Solo en la ficha completa. */
  director: string | null;
  /** Solo en la ficha completa: reparto principal. */
  cast: string[];
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Modelo de dominio de una película. Es inmutable y concentra la lógica
 * derivada (etiquetas, nivel de puntuación) para que las vistas no la repitan.
 */
export class Movie implements MovieProps {
  readonly id: string;
  readonly title: string;
  readonly year: number | null;
  readonly releaseDate: string | null;
  readonly genres: string[];
  readonly rating: number | null;
  readonly voteCount: number | null;
  readonly poster: string | null;
  readonly backdrop: string | null;
  readonly description: string | null;
  readonly runtime: number | null;
  readonly director: string | null;
  readonly cast: string[];

  constructor(props: MovieProps) {
    this.id = props.id;
    this.title = props.title;
    this.year = props.year;
    this.releaseDate = props.releaseDate;
    this.genres = [...props.genres];
    this.rating = props.rating;
    this.voteCount = props.voteCount;
    this.poster = props.poster;
    this.backdrop = props.backdrop;
    this.description = props.description;
    this.runtime = props.runtime;
    this.director = props.director;
    this.cast = [...props.cast];
  }

  /** Género principal (el primero que informa TMDB). */
  get primaryGenre(): string {
    return this.genres[0] ?? "Sin género";
  }

  get yearLabel(): string {
    return this.year === null ? "—" : String(this.year);
  }

  get hasRating(): boolean {
    return this.rating !== null;
  }

  /** Puntuación con un decimal ("7.8") o "–" si no existe. */
  get ratingLabel(): string {
    return this.rating === null ? "–" : this.rating.toFixed(1);
  }

  /**
   * Color de la insignia. TMDB no define rangos oficiales: se usan umbrales
   * propios (7.0 o más = verde, 5.0 a 6.9 = amarillo, menos de 5.0 = rojo).
   */
  get scoreTier(): ScoreTier {
    if (this.rating === null) return "none";
    if (this.rating >= 7) return "high";
    if (this.rating >= 5) return "mixed";
    return "low";
  }

  /** Página de la película en themoviedb.org (para el enlace "Ver en TMDB"). */
  get url(): string {
    return `https://www.themoviedb.org/movie/${this.id}`;
  }

  /** "2 h 5 min", "45 min" o null si no se conoce la duración. */
  get runtimeLabel(): string | null {
    if (this.runtime === null || this.runtime <= 0) return null;
    const hours = Math.floor(this.runtime / 60);
    const minutes = this.runtime % 60;
    if (hours === 0) return `${minutes} min`;
    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
  }

  /** "14 mar 2026" o null si no hay fecha válida. */
  get releaseLabel(): string | null {
    const match = this.releaseDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const month = MONTHS[Number(match[2]) - 1];
    if (!month) return null;
    return `${Number(match[3])} ${month} ${match[1]}`;
  }

  toJSON(): MovieProps {
    return {
      id: this.id,
      title: this.title,
      year: this.year,
      releaseDate: this.releaseDate,
      genres: this.genres,
      rating: this.rating,
      voteCount: this.voteCount,
      poster: this.poster,
      backdrop: this.backdrop,
      description: this.description,
      runtime: this.runtime,
      director: this.director,
      cast: this.cast,
    };
  }

  /** Reconstruye una película desde datos guardados; devuelve null si están corruptos. */
  static fromJSON(raw: unknown): Movie | null {
    if (typeof raw !== "object" || raw === null) return null;
    const data = raw as Record<string, unknown>;
    if (typeof data.id !== "string" || typeof data.title !== "string") return null;

    const text = (value: unknown): string | null => (typeof value === "string" ? value : null);
    const numeric = (value: unknown): number | null =>
      typeof value === "number" && Number.isFinite(value) ? value : null;
    const strings = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

    return new Movie({
      id: data.id,
      title: data.title,
      year: numeric(data.year),
      releaseDate: text(data.releaseDate),
      genres: strings(data.genres),
      rating: numeric(data.rating),
      voteCount: numeric(data.voteCount),
      poster: text(data.poster),
      backdrop: text(data.backdrop),
      description: text(data.description),
      runtime: numeric(data.runtime),
      director: text(data.director),
      cast: strings(data.cast),
    });
  }
}
