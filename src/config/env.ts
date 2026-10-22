/**
 * Configuración leída del entorno. Expo expone al cliente solo las variables
 * con prefijo EXPO_PUBLIC_ (se definen en el archivo `.env`, ver `.env.example`).
 * Se accede con el nombre literal para que Expo pueda reemplazarlo al compilar.
 */
export const env = {
  /** "Token de acceso de lectura a la API" de TMDB (el largo, que empieza con "eyJ"). */
  tmdbAccessToken: process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN ?? "",
} as const;
