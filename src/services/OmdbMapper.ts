import { Movie } from "@/models/Movie";
import type { OmdbMovieDto } from "./omdbTypes";

/** Traduce los DTO de OMDb al modelo de dominio `Movie`. */
export class OmdbMapper {
  static toMovie(dto: OmdbMovieDto): Movie {
    return new Movie({
      id: dto.imdbID,
      title: dto.Title,
      year: this.integer(dto.Year),
      genres: this.list(dto.Genre),
      metascore: this.integer(dto.Metascore),
      imdbRating: this.decimal(dto.imdbRating),
      poster: this.text(dto.Poster),
      plot: this.text(dto.Plot),
      director: this.text(dto.Director),
      writer: this.text(dto.Writer),
      cast: this.list(dto.Actors),
    });
  }

  /** OMDb usa la cadena "N/A" para los datos que no existen. */
  private static text(value: string | undefined): string | null {
    const clean = value?.trim();
    return !clean || clean === "N/A" ? null : clean;
  }

  private static list(value: string | undefined): string[] {
    return (
      this.text(value)
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? []
    );
  }

  private static integer(value: string | undefined): number | null {
    const parsed = Number.parseInt(this.text(value) ?? "", 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private static decimal(value: string | undefined): number | null {
    const parsed = Number.parseFloat(this.text(value) ?? "");
    return Number.isNaN(parsed) ? null : parsed;
  }
}
