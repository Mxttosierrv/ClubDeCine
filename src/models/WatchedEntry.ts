import { Movie } from "./Movie";

export interface WatchedEntrySnapshot {
  movie: ReturnType<Movie["toJSON"]>;
  watchedAt: string;
}

/** Una película marcada como vista, junto con la fecha en que se marcó. */
export class WatchedEntry {
  constructor(
    readonly movie: Movie,
    readonly watchedAt: Date,
  ) {}

  get id(): string {
    return this.movie.id;
  }

  /** Ej.: "19 oct 2026". */
  get watchedLabel(): string {
    return this.watchedAt.toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  toJSON(): WatchedEntrySnapshot {
    return { movie: this.movie.toJSON(), watchedAt: this.watchedAt.toISOString() };
  }

  static fromJSON(raw: unknown): WatchedEntry | null {
    if (typeof raw !== "object" || raw === null) return null;
    const data = raw as Record<string, unknown>;
    const movie = Movie.fromJSON(data.movie);
    const date = typeof data.watchedAt === "string" ? new Date(data.watchedAt) : null;
    if (!movie || !date || Number.isNaN(date.getTime())) return null;
    return new WatchedEntry(movie, date);
  }
}
