# Framelist

App móvil (React Native + Expo + NativeWind/Tailwind) para guardar películas en una watchlist, con Metascore de Metacritic.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # y pega tu API key gratuita de https://www.omdbapi.com/apikey.aspx
npx expo start --clear      # escanea el QR con Expo Go
```

## Estructura

```
App.tsx                      Fuentes + proveedores
src/
  models/                    Movie, Library, WatchedEntry, UserProfile (dominio, inmutables)
  services/                  OmdbClient (HTTP) · OmdbMapper · MovieRepository (caché) · LibraryStorage
  context/LibraryContext     Estado global de la biblioteca + persistencia
  hooks/                     useMovieSearch (paginación) · useDebouncedValue
  navigation/                AppShell + rutas
  screens/                   HomeScreen · MoviesScreen · ProfileScreen
  components/ui|layout|movies  Componentes reutilizables
  theme/palette.js           Colores (fuente única para Tailwind y código)
```

## Agregar una función nueva
1. Regla de negocio → método en `models/`.
2. Datos externos → método en `MovieRepository` (y `OmdbClient` si hace falta).
3. UI → componente en `components/` y úsalo desde la pantalla.
