/** Formas crudas de las respuestas de la API de OMDb (https://www.omdbapi.com). */

export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Response: "True" | "False";
  Search?: OmdbSearchItem[];
  totalResults?: string;
  Error?: string;
}

export interface OmdbMovieDto {
  Response: "True" | "False";
  Error?: string;
  imdbID: string;
  Title: string;
  Year: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Poster?: string;
  /** Metascore de Metacritic (0–100) o "N/A". */
  Metascore?: string;
  imdbRating?: string;
}
