import { Movie } from "./Movie";
import { WatchedEntry, type WatchedEntrySnapshot } from "./WatchedEntry";

export type MoveDirection = "up" | "down";

export interface LibrarySnapshot {
  watchlist: ReturnType<Movie["toJSON"]>[];
  watched: WatchedEntrySnapshot[];
  lists: string[];
}

const DEFAULT_LISTS = ["Para este finde"];

/**
 * Biblioteca personal del usuario: watchlist, películas vistas y listas.
 * Es inmutable: cada operación devuelve una nueva instancia, de modo que
 * React detecta el cambio y las reglas de negocio quedan fuera de las vistas.
 */
export class Library {
  private constructor(
    readonly watchlist: readonly Movie[],
    readonly watched: readonly WatchedEntry[],
    readonly lists: readonly string[],
  ) {}

  static empty(): Library {
    return new Library([], [], DEFAULT_LISTS);
  }

  /** Película destacada en Inicio: la primera de la watchlist. */
  get featured(): Movie | undefined {
    return this.watchlist[0];
  }

  get totalSaved(): number {
    return this.watchlist.length + this.watched.length;
  }

  isInWatchlist(id: string): boolean {
    return this.watchlist.some((movie) => movie.id === id);
  }

  isWatched(id: string): boolean {
    return this.watched.some((entry) => entry.id === id);
  }

  /** True si la película ya está guardada (pendiente o vista). */
  contains(id: string): boolean {
    return this.isInWatchlist(id) || this.isWatched(id);
  }

  add(movie: Movie): Library {
    if (this.contains(movie.id)) return this;
    return new Library([...this.watchlist, movie], this.watched, this.lists);
  }

  remove(id: string): Library {
    if (!this.isInWatchlist(id)) return this;
    return new Library(
      this.watchlist.filter((movie) => movie.id !== id),
      this.watched,
      this.lists,
    );
  }

  markWatched(id: string, at: Date = new Date()): Library {
    const movie = this.watchlist.find((item) => item.id === id);
    if (!movie) return this;
    return new Library(
      this.watchlist.filter((item) => item.id !== id),
      [new WatchedEntry(movie, at), ...this.watched],
      this.lists,
    );
  }

  removeWatched(id: string): Library {
    if (!this.isWatched(id)) return this;
    return new Library(
      this.watchlist,
      this.watched.filter((entry) => entry.id !== id),
      this.lists,
    );
  }

  move(id: string, direction: MoveDirection): Library {
    const from = this.watchlist.findIndex((movie) => movie.id === id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= this.watchlist.length) return this;

    const next = [...this.watchlist];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return new Library(next, this.watched, this.lists);
  }

  createList(name: string): Library {
    const clean = name.trim();
    if (!clean) return this;
    const exists = this.lists.some((list) => list.toLowerCase() === clean.toLowerCase());
    if (exists) return this;
    return new Library(this.watchlist, this.watched, [...this.lists, clean]);
  }

  toSnapshot(): LibrarySnapshot {
    return {
      watchlist: this.watchlist.map((movie) => movie.toJSON()),
      watched: this.watched.map((entry) => entry.toJSON()),
      lists: [...this.lists],
    };
  }

  /** Reconstruye la biblioteca desde datos guardados, descartando lo corrupto. */
  static fromSnapshot(raw: unknown): Library {
    if (typeof raw !== "object" || raw === null) return Library.empty();
    const data = raw as Record<string, unknown>;

    const watchlist = (Array.isArray(data.watchlist) ? data.watchlist : [])
      .map((item) => Movie.fromJSON(item))
      .filter((movie): movie is Movie => movie !== null);
    const watched = (Array.isArray(data.watched) ? data.watched : [])
      .map((item) => WatchedEntry.fromJSON(item))
      .filter((entry): entry is WatchedEntry => entry !== null);
    const lists = (Array.isArray(data.lists) ? data.lists : []).filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );

    return new Library(watchlist, watched, lists.length > 0 ? lists : DEFAULT_LISTS);
  }
}
