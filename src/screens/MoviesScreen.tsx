import { useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { palette } from "@/theme/palette";
import { useLibrary } from "@/context/LibraryContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGenres } from "@/hooks/useGenres";
import { useMovieCatalog } from "@/hooks/useMovieCatalog";
import type { Movie } from "@/models/Movie";
import type { BrowseSort } from "@/services/MovieRepository";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieDetailsSheet } from "@/components/movies/MovieDetailsSheet";
import { AppText } from "@/components/ui/AppText";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TmdbAttribution } from "@/components/ui/TmdbAttribution";

const SORT_OPTIONS: { key: BrowseSort; label: string }[] = [
  { key: "popular", label: "Populares" },
  { key: "rating", label: "Mejor valoradas" },
];

/** Notas mínimas de TMDB (0–10) que se ofrecen como filtro. */
const MIN_RATINGS = [6, 7, 8];

interface LocalFilters {
  genreName: string | null;
  year: number | null;
  minRating: number | null;
  sort: BrowseSort;
}

/**
 * En una búsqueda, TMDB no admite filtros ni orden: se aplican en el
 * dispositivo sobre los resultados ya cargados. Al explorar, en cambio, los
 * filtra y ordena el servidor.
 */
function refineLocally(movies: Movie[], filters: LocalFilters): Movie[] {
  const filtered = movies.filter(
    (movie) =>
      (filters.genreName === null || movie.genres.includes(filters.genreName)) &&
      (filters.year === null || movie.year === filters.year) &&
      (filters.minRating === null || (movie.rating !== null && movie.rating >= filters.minRating)),
  );
  return filters.sort === "rating"
    ? [...filtered].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    : filtered;
}

/** Catálogo de TMDB: películas populares, con búsqueda, orden y filtros. */
export function MoviesScreen() {
  const { library, addMovie } = useLibrary();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<BrowseSort>("popular");
  const [year, setYear] = useState<number | null>(null);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);

  const debouncedQuery = useDebouncedValue(query, 450);
  const catalog = useMovieCatalog({ query: debouncedQuery, sort, year, genreId, minRating });
  const genres = useGenres();

  // Los últimos tres años como atajo de filtro por estreno.
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, []);

  const visible = useMemo(() => {
    if (!catalog.searching) return catalog.movies;
    const genreName = genres.find((genre) => genre.id === genreId)?.name ?? null;
    return refineLocally(catalog.movies, { genreName, year, minRating, sort });
  }, [catalog.movies, catalog.searching, genres, genreId, year, minRating, sort]);

  // Se agrega un espacio vacío si el total es impar para que la última tarjeta no se estire.
  const items: (Movie | null)[] = visible.length % 2 === 1 ? [...visible, null] : visible;

  const header = (
    <View>
      <View className="mb-6 flex-row items-end justify-between">
        <View>
          <AppText tone="accent" font="heavy" className="mb-2 text-[10px] tracking-[1.8px]">
            DESCUBRE
          </AppText>
          <AppText font="display" className="text-[31px] leading-[34px] tracking-[-1.5px]">
            Películas
          </AppText>
        </View>
        <AppText tone="dim" className="pb-[3px] text-[11px]">
          {catalog.status === "ready" ? `${visible.length} títulos` : ""}
        </AppText>
      </View>

      <View className="h-[46px] flex-row items-center gap-[10px] rounded-[14px] border border-[#303530] bg-field px-[14px]">
        <Icon name="search" size={19} color={palette.dim} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por título"
          placeholderTextColor="#6f756f"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="min-w-0 flex-1 font-sans text-[13px] text-text"
        />
      </View>

      {/* Orden (excluyente) y nota mínima (se activa y desactiva al tocarla). */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="mt-[10px] grow-0"
        contentContainerClassName="gap-2"
      >
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            active={sort === option.key}
            onPress={() => setSort(option.key)}
          />
        ))}
        {MIN_RATINGS.map((value) => (
          <Chip
            key={value}
            label={`Nota ${value}+`}
            active={minRating === value}
            onPress={() => setMinRating(minRating === value ? null : value)}
          />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="mt-2 grow-0"
        contentContainerClassName="gap-2"
      >
        <Chip label="Todos los años" active={year === null} onPress={() => setYear(null)} />
        {yearOptions.map((option) => (
          <Chip
            key={option}
            label={String(option)}
            active={year === option}
            onPress={() => setYear(option)}
          />
        ))}
      </ScrollView>

      {genres.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="mt-2 grow-0"
          contentContainerClassName="gap-2"
        >
          <Chip label="Todos" active={genreId === null} onPress={() => setGenreId(null)} />
          {genres.map((genre) => (
            <Chip
              key={genre.id}
              label={genre.name}
              active={genreId === genre.id}
              onPress={() => setGenreId(genre.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View className="h-5" />
    </View>
  );

  let body: ReactNode = null;
  if (catalog.status === "loading") {
    body = (
      <View className="items-center py-16">
        <ActivityIndicator color={palette.lime} />
      </View>
    );
  } else if (catalog.status === "error") {
    body = (
      <EmptyState
        title="No pudimos cargar películas"
        message={catalog.error ?? "Ocurrió un error inesperado."}
      >
        <PrimaryButton className="mt-4 self-stretch" label="Reintentar" onPress={catalog.retry} />
      </EmptyState>
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        message={
          catalog.movies.length === 0
            ? "No se encontraron películas con esos criterios."
            : "Ninguna película cargada coincide con los filtros. Prueba con “Cargar más” o cambia los filtros."
        }
      />
    );
  }

  const footer = (
    <View>
      {catalog.status === "ready" && catalog.hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={catalog.loadMore}
          disabled={catalog.loadingMore}
          className="mt-4 h-11 items-center justify-center rounded-[14px] border border-outline bg-raised active:opacity-80"
        >
          {catalog.loadingMore ? (
            <ActivityIndicator color={palette.lime} />
          ) : (
            <AppText tone="soft" font="bold" className="text-xs">
              Cargar más películas
            </AppText>
          )}
        </Pressable>
      ) : null}
      {catalog.status === "ready" && catalog.error ? (
        <AppText tone="danger" className="mt-3 text-center text-[11px]">
          {catalog.error}
        </AppText>
      ) : null}
      <View className="mx-5 mt-[22px]">
        <TmdbAttribution compact />
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        data={body ? [] : items}
        numColumns={2}
        key="movie-grid"
        keyExtractor={(item, index) => item?.id ?? `spacer-${index}`}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerClassName="px-[21px] pb-6 pt-[34px]"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        ListEmptyComponent={body ?? undefined}
        ListFooterComponent={footer}
        renderItem={({ item }) =>
          item ? (
            <MovieCard
              movie={item}
              saved={library.contains(item.id)}
              onOpen={setSelected}
              onAdd={addMovie}
            />
          ) : (
            <View className="flex-1" />
          )
        }
      />

      <MovieDetailsSheet
        movie={selected}
        saved={selected ? library.contains(selected.id) : false}
        onAdd={addMovie}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
