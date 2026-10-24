import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from "react-native";
import { palette } from "@/theme/palette";
import { useLibrary } from "@/context/LibraryContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGenres } from "@/hooks/useGenres";
import { useMovieCatalog } from "@/hooks/useMovieCatalog";
import { CatalogFilters } from "@/models/CatalogFilters";
import type { Movie } from "@/models/Movie";
import { MovieFilterBar } from "@/components/filters/MovieFilterBar";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieDetailsSheet } from "@/components/movies/MovieDetailsSheet";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TmdbAttribution } from "@/components/ui/TmdbAttribution";

const FILTER_DEBOUNCE_MS = 350;

const RowSeparator = () => <View className="h-3" />;

/** Catálogo de TMDB: películas populares, con búsqueda, orden y filtros. */
export function MoviesScreen() {
  const { library, addMovie } = useLibrary();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(CatalogFilters.DEFAULT);
  const [selected, setSelected] = useState<Movie | null>(null);

  const openMovie = useCallback((movie: Movie) => setSelected(movie), []);
  const clearQuery = useCallback(() => setQuery(""), []);

  const debouncedQuery = useDebouncedValue(query, 450);
  const debouncedFilters = useDebouncedValue(filters, FILTER_DEBOUNCE_MS);
  const catalog = useMovieCatalog({ query: debouncedQuery, filters: debouncedFilters });
  const { genres, status: genresStatus, retry: retryGenres } = useGenres();

  const visible = useMemo(
    () => (catalog.searching ? filters.apply(catalog.movies, genres) : filters.arrange(catalog.movies)),
    [catalog.searching, catalog.movies, filters, genres],
  );

  const items = useMemo<(Movie | null)[]>(
    () => (visible.length % 2 === 1 ? [...visible, null] : visible),
    [visible],
  );

  const renderItem = useCallback(
    ({ item }: { item: Movie | null }) =>
      item ? (
        <MovieCard movie={item} saved={library.contains(item.id)} onOpen={openMovie} onAdd={addMovie} />
      ) : (
        <View className="flex-1" />
      ),
    [library, addMovie, openMovie],
  );

  const clearFilters = () => setFilters(CatalogFilters.DEFAULT);

  const summary = (() => {
    if (catalog.status !== "ready") return "";
    const count = `${visible.length}${catalog.hasMore ? "+" : ""} ${visible.length === 1 ? "película" : "películas"}`;
    if (filters.genreIds.length < 2) return count;
    return `${count} · ${filters.genreMatch === "all" ? "con todos los géneros elegidos" : "con alguno de los géneros elegidos"}`;
  })();

  const header = (
    <View>
      <View className="mb-6">
        <AppText tone="accent" font="heavy" className="mb-2 text-[10px] tracking-[1.8px]">
          DESCUBRE
        </AppText>
        <AppText font="display" className="text-[31px] leading-[34px] tracking-[-1.5px]">
          Películas
        </AppText>
      </View>

      <View className="mb-3 h-[46px] flex-row items-center gap-[10px] rounded-[14px] border border-[#303530] bg-field px-[14px]">
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

      <MovieFilterBar
        filters={filters}
        onChange={setFilters}
        genres={genres}
        genresStatus={genresStatus}
        onRetryGenres={retryGenres}
        query={query}
        onClearQuery={clearQuery}
      />

      <AppText tone="dim" className="mb-4 mt-4 min-h-[14px] text-[11px]">
        {summary}
      </AppText>
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
    const filtered = !filters.isDefault;
    body = (
      <EmptyState
        title={filtered ? "Sin resultados" : undefined}
        message={
          filtered
            ? "Ninguna película coincide con estos filtros. Prueba quitando alguno."
            : "No se encontraron películas con esos criterios."
        }
      >
        {filtered ? (
          <PrimaryButton className="mt-4 self-stretch" label="Quitar filtros" onPress={clearFilters} />
        ) : null}
      </EmptyState>
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
        ItemSeparatorComponent={RowSeparator}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        contentContainerClassName="px-[21px] pb-6 pt-[34px]"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        ListEmptyComponent={body ?? undefined}
        ListFooterComponent={footer}
        renderItem={renderItem}
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