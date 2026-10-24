import type { Genre } from "./Genre";
import type { Movie } from "./Movie";
import {
  DEFAULT_SORT,
  movieComparator,
  sortOptionOf,
  type SortKey,
  type SortOption,
} from "./SortOption";

/** "all": la película debe tener todos los géneros elegidos; "any": al menos uno. */
export type GenreMatch = "all" | "any";

/** Un filtro aplicado, listo para mostrarse como etiqueta que se puede quitar. */
export interface ActiveFilter {
  key: string;
  label: string;
  /** Devuelve los filtros sin este criterio (vuelve a su valor base). */
  remove: (filters: CatalogFilters) => CatalogFilters;
}

/**
 * Filtros y orden del catálogo de películas. Es inmutable: cada cambio devuelve
 * una instancia nueva (o la misma, si no hay cambio real), así React detecta
 * cuándo cambió algo y las pantallas no repiten reglas de filtrado.
 */
export class CatalogFilters {
  /** Estado base: sin filtros y ordenado por popularidad. */
  static readonly DEFAULT: CatalogFilters = new CatalogFilters(DEFAULT_SORT, [], "all", null, null);

  private constructor(
    readonly sort: SortKey,
    /** Ids de género de TMDB, en el orden en que se eligieron. */
    readonly genreIds: readonly number[],
    readonly genreMatch: GenreMatch,
    /** Año de estreno; null = todos. */
    readonly year: number | null,
    /** Puntuación mínima de TMDB (0–10); null = cualquiera. */
    readonly minRating: number | null,
  ) {}

  get sortOption(): SortOption {
    return sortOptionOf(this.sort);
  }

  get isDefault(): boolean {
    return (
      this.sort === DEFAULT_SORT &&
      this.genreIds.length === 0 &&
      this.year === null &&
      this.minRating === null
    );
  }

  withSort(sort: SortKey): CatalogFilters {
    return sort === this.sort ? this : this.copy({ sort });
  }

  /** Agrega el género si no estaba elegido y lo quita si ya lo estaba. */
  toggleGenre(id: number): CatalogFilters {
    return this.hasGenre(id) ? this.withoutGenre(id) : this.copy({ genreIds: [...this.genreIds, id] });
  }

  withoutGenre(id: number): CatalogFilters {
    return this.hasGenre(id)
      ? this.copy({ genreIds: this.genreIds.filter((genreId) => genreId !== id) })
      : this;
  }

  clearGenres(): CatalogFilters {
    return this.genreIds.length === 0 ? this : this.copy({ genreIds: [] });
  }

  withGenreMatch(genreMatch: GenreMatch): CatalogFilters {
    return genreMatch === this.genreMatch ? this : this.copy({ genreMatch });
  }

  withYear(year: number | null): CatalogFilters {
    return year === this.year ? this : this.copy({ year });
  }

  withMinRating(minRating: number | null): CatalogFilters {
    return minRating === this.minRating ? this : this.copy({ minRating });
  }

  hasGenre(id: number): boolean {
    return this.genreIds.includes(id);
  }

  /** Los filtros aplicados, en el orden en que se muestran como etiquetas. */
  activeFilters(genres: readonly Genre[]): ActiveFilter[] {
    const active: ActiveFilter[] = [];

    if (this.sort !== DEFAULT_SORT) {
      active.push({
        key: "sort",
        label: `Orden: ${this.sortOption.summary}`,
        remove: (filters) => filters.withSort(DEFAULT_SORT),
      });
    }
    for (const id of this.genreIds) {
      active.push({
        key: `genre-${id}`,
        label: genres.find((genre) => genre.id === id)?.name ?? `Género ${id}`,
        remove: (filters) => filters.withoutGenre(id),
      });
    }
    if (this.year !== null) {
      active.push({
        key: "year",
        label: `Estreno: ${this.year}`,
        remove: (filters) => filters.withYear(null),
      });
    }
    if (this.minRating !== null) {
      active.push({
        key: "rating",
        label: `Nota ${this.minRating}+`,
        remove: (filters) => filters.withMinRating(null),
      });
    }
    return active;
  }

  /**
   * Filtra y ordena en el dispositivo. Se usa en las búsquedas por título,
   * porque la búsqueda de TMDB no admite filtros ni orden.
   */
  apply(movies: readonly Movie[], genres: readonly Genre[]): Movie[] {
    const wanted = this.genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .filter((name): name is string => name !== undefined);

    const matches = (movie: Movie): boolean => {
      if (wanted.length > 0) {
        const hit =
          this.genreMatch === "all"
            ? wanted.every((name) => movie.genres.includes(name))
            : wanted.some((name) => movie.genres.includes(name));
        if (!hit) return false;
      }
      if (this.year !== null && movie.year !== this.year) return false;
      if (this.minRating !== null && (movie.rating === null || movie.rating < this.minRating)) {
        return false;
      }
      return true;
    };

    const compare = movieComparator(this.sort);
    const kept = movies.filter(matches);
    return compare ? kept.sort(compare) : kept;
  }

  /**
   * Al explorar, el servidor ya filtra y ordena; solo falta el orden que TMDB
   * no sabe hacer (por nombre), que se aplica a las películas ya cargadas.
   */
  arrange(movies: readonly Movie[]): Movie[] {
    const compare = this.sortOption.localOnly ? movieComparator(this.sort) : null;
    return compare ? [...movies].sort(compare) : [...movies];
  }

  private copy(patch: {
    sort?: SortKey;
    genreIds?: readonly number[];
    genreMatch?: GenreMatch;
    year?: number | null;
    minRating?: number | null;
  }): CatalogFilters {
    const genreIds = patch.genreIds ?? this.genreIds;
    return new CatalogFilters(
      patch.sort ?? this.sort,
      genreIds,
      // Con menos de dos géneros el modo no aplica: se vuelve al valor base.
      genreIds.length < 2 ? "all" : (patch.genreMatch ?? this.genreMatch),
      patch.year === undefined ? this.year : patch.year,
      patch.minRating === undefined ? this.minRating : patch.minRating,
    );
  }
}
