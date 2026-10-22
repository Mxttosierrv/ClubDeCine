import { env } from "@/config/env";
import { LibraryStorage } from "./LibraryStorage";
import { MovieRepository } from "./MovieRepository";
import { TmdbClient } from "./TmdbClient";

/** Composición de dependencias: un único lugar donde se instancian los servicios. */
export const movieRepository = new MovieRepository(new TmdbClient(env.tmdbAccessToken));
export const libraryStorage = new LibraryStorage();
