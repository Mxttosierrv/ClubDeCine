export type ScoreTier = "high" | "mixed" | "low" | "none";

/** Datos planos de una película (lo que se serializa a disco). */
export interface MovieProps {
  id: string;
  title: string;
  year: number | null;
  genres: string[];
  metascore: number | null;
  imdbRating: number | null;
  poster: string | null;
  plot: string | null;
  director: string | null;
  writer: string | null;
  cast: string[];
}

/**
 * Modelo de dominio de una película. Es inmutable y concentra la lógica
 * derivada (etiquetas, nivel de Metascore) para que las vistas no la repitan.
 */
export class Movie implements MovieProps {
  readonly id: string;
  readonly title: string;
  readonly year: number | null;
  readonly genres: string[];
  readonly metascore: number | null;
  readonly imdbRating: number | null;
  readonly poster: string | null;
  readonly plot: string | null;
  readonly director: string | null;
  readonly writer: string | null;
  readonly cast: string[];

  constructor(props: MovieProps) {
    this.id = props.id;
    this.title = props.title;
    this.year = props.year;
    this.genres = [...props.genres];
    this.metascore = props.metascore;
    this.imdbRating = props.imdbRating;
    this.poster = props.poster;
    this.plot = props.plot;
    this.director = props.director;
    this.writer = props.writer;
    this.cast = [...props.cast];
  }

  /** Género principal (el primero que informa la API). */
  get primaryGenre(): string {
    return this.genres[0] ?? "Sin género";
  }

  get yearLabel(): string {
    return this.year === null ? "—" : String(this.year);
  }

  get hasMetascore(): boolean {
    return this.metascore !== null;
  }

  /**
   * Rangos oficiales de color de Metacritic para películas:
   * 61–100 verde (favorable), 40–60 amarillo (mixto), 0–39 rojo (desfavorable).
   */
  get scoreTier(): ScoreTier {
    if (this.metascore === null) return "none";
    if (this.metascore >= 61) return "high";
    if (this.metascore >= 40) return "mixed";
    return "low";
  }

  get imdbLabel(): string {
    return this.imdbRating === null ? "—" : this.imdbRating.toFixed(1);
  }

  toJSON(): MovieProps {
    return {
      id: this.id,
      title: this.title,
      year: this.year,
      genres: this.genres,
      metascore: this.metascore,
      imdbRating: this.imdbRating,
      poster: this.poster,
      plot: this.plot,
      director: this.director,
      writer: this.writer,
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
      genres: strings(data.genres),
      metascore: numeric(data.metascore),
      imdbRating: numeric(data.imdbRating),
      poster: text(data.poster),
      plot: text(data.plot),
      director: text(data.director),
      writer: text(data.writer),
      cast: strings(data.cast),
    });
  }
}
