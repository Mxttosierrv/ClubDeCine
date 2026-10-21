import { env } from "@/config/env";
import { LibraryStorage } from "./LibraryStorage";
import { MovieRepository } from "./MovieRepository";
import { OmdbClient } from "./OmdbClient";

/** Composición de dependencias: un único lugar donde se instancian los servicios. */
export const movieRepository = new MovieRepository(new OmdbClient(env.omdbApiKey));
export const libraryStorage = new LibraryStorage();
