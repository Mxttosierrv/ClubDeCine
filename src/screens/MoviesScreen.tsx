import { useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { palette } from "@/theme/palette";
import { useLibrary } from "@/context/LibraryContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMovieSearch } from "@/hooks/useMovieSearch";
import type { Movie } from "@/models/Movie";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieDetailsSheet } from "@/components/movies/MovieDetailsSheet";
import { AppText } from "@/components/ui/AppText";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type SortKey = "metascore" | "imdb" | "name";

const ALL_GENRES = "Todos";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "metascore", label: "Metascore" },
  { key: "imdb", label: "IMDb" },
  { key: "name", label: "Nombre A–Z" },
];

/** Las películas sin dato van siempre al final al ordenar por puntaje. */
function compareScores(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function sortMovies(movies: Movie[], key: SortKey): Movie[] {
  const copy = [...movies];
  switch (key) {
    case "name":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "imdb":
      return copy.sort((a, b) => compareScores(a.imdbRating, b.imdbRating));
    case "metascore":
      return copy.sort((a, b) => compareScores(a.metascore, b.metascore));
  }
}

/** Catálogo real: busca en OMDb (que incluye el Metascore de Metacritic). */
export function MoviesScreen() {
  const { library, addMovie } = useLibrary();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState(ALL_GENRES);
  const [sort, setSort] = useState<SortKey>("metascore");
  const [selected, setSelected] = useState<Movie | null>(null);

  const debouncedQuery = useDebouncedValue(query, 450);
  const search = useMovieSearch(debouncedQuery);

  const genres = useMemo(() => {
    const unique = new Set<string>();
    search.movies.forEach((movie) => movie.genres.forEach((item) => unique.add(item)));
    return [ALL_GENRES, ...[...unique].sort((a, b) => a.localeCompare(b))];
  }, [search.movies]);

  // Si el género elegido ya no existe en los resultados, se vuelve a "Todos".
  const activeGenre = genres.includes(genre) ? genre : ALL_GENRES;

  const visible = useMemo(() => {
    const filtered =
      activeGenre === ALL_GENRES
        ? search.movies
        : search.movies.filter((movie) => movie.genres.includes(activeGenre));
    return sortMovies(filtered, sort);
  }, [search.movies, activeGenre, sort]);

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
          {search.status === "ready" ? `${search.total} títulos` : ""}
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="mt-[10px] grow-0"
        contentContainerClassName="gap-2"
      >
        {genres.map((item) => (
          <Chip key={item} label={item} active={item === activeGenre} onPress={() => setGenre(item)} />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className="mb-5 mt-2 grow-0"
        contentContainerClassName="gap-2"
      >
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            label={`Ordenar: ${option.label}`}
            active={sort === option.key}
            onPress={() => setSort(option.key)}
          />
        ))}
      </ScrollView>
    </View>
  );

  let body: ReactNode = null;
  if (search.status === "loading") {
    body = (
      <View className="items-center py-16">
        <ActivityIndicator color={palette.lime} />
      </View>
    );
  } else if (search.status === "error") {
    body = (
      <EmptyState
        title="No pudimos cargar películas"
        message={search.error ?? "Ocurrió un error inesperado."}
      >
        <PrimaryButton className="mt-4 self-stretch" label="Reintentar" onPress={search.retry} />
      </EmptyState>
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        message={
          search.movies.length === 0
            ? "No se encontraron películas con ese título."
            : "Ninguna película cargada coincide con este género."
        }
      />
    );
  }

  const footer = (
    <View>
      {search.status === "ready" && search.hasMore ? (
        <Pressable
          accessibilityRole="button"
          onPress={search.loadMore}
          disabled={search.loadingMore}
          className="mt-4 h-11 items-center justify-center rounded-[14px] border border-outline bg-raised active:opacity-80"
        >
          {search.loadingMore ? (
            <ActivityIndicator color={palette.lime} />
          ) : (
            <AppText tone="soft" font="bold" className="text-xs">
              Cargar más películas
            </AppText>
          )}
        </Pressable>
      ) : null}
      {search.status === "ready" && search.error ? (
        <AppText tone="danger" className="mt-3 text-center text-[11px]">
          {search.error}
        </AppText>
      ) : null}
      <AppText tone="dim" className="mx-5 mt-[22px] text-center text-[9px] leading-[14px]">
        Datos de OMDb · Metascore © Metacritic
      </AppText>
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
