/**
 * Configuración leída del entorno. Expo expone al cliente solo las variables
 * con prefijo EXPO_PUBLIC_ (se definen en el archivo `.env`, ver `.env.example`).
 */
export const env = {
  omdbApiKey: process.env.EXPO_PUBLIC_OMDB_API_KEY ?? "",
} as const;
