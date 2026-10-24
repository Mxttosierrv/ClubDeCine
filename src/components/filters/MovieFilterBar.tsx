import { useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import { CatalogFilters } from "@/models/CatalogFilters";
import type { Genre } from "@/models/Genre";
import { SORT_OPTIONS, type SortKey } from "@/models/SortOption";
import type { GenresStatus } from "@/hooks/useGenres";
import { AppText } from "@/components/ui/AppText";
import { ActiveFilterChips, type FilterChip } from "./ActiveFilterChips";
import { ChoiceList, type Choice } from "./ChoiceList";
import { FilterTrigger } from "./FilterTrigger";
import { GenreChecklist } from "./GenreChecklist";

type PanelId = "sort" | "genre" | "year" | "rating";

interface MovieFilterBarProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  genres: readonly Genre[];
  genresStatus: GenresStatus;
  onRetryGenres: () => void;
  /** Texto de búsqueda aplicado; si existe, se muestra también como filtro que se puede quitar. */
  query: string;
  onClearQuery: () => void;
}

const SORT_CHOICES: Choice<SortKey>[] = SORT_OPTIONS.map((option) => ({
  value: option.key,
  label: option.label,
  section: option.section,
}));

const RATING_CHOICES: Choice<number | null>[] = [
  { value: null, label: "Cualquiera" },
  { value: 5, label: "5.0 o más" },
  { value: 6, label: "6.0 o más" },
  { value: 7, label: "7.0 o más" },
  { value: 8, label: "8.0 o más" },
];

const OLDEST_YEAR = 1950;

/** Años desde el actual hasta 1950, precedidos por "Todos". */
function buildYearChoices(): Choice<number | null>[] {
  const current = new Date().getFullYear();
  const years: Choice<number | null>[] = [{ value: null, label: "Todos" }];
  for (let year = current; year >= OLDEST_YEAR; year--) years.push({ value: year, label: String(year) });
  return years;
}

function genreSummary(filters: CatalogFilters, genres: readonly Genre[]): string {
  const [first, ...rest] = filters.genreIds;
  if (first === undefined) return "Todos";
  const name = genres.find((genre) => genre.id === first)?.name ?? "Género";
  return rest.length === 0 ? name : `${name} +${rest.length}`;
}

function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Barra de filtros: cuatro menús desplegables (orden, género con casillas, año
 * y nota mínima) y, debajo, los filtros aplicados como botones que se quitan
 * al tocarlos. Es un componente "controlado": no guarda los filtros, solo qué
 * menú está abierto; los cambios salen por `onChange`.
 */
export function MovieFilterBar({
  filters,
  onChange,
  genres,
  genresStatus,
  onRetryGenres,
  query,
  onClearQuery,
}: MovieFilterBarProps) {
  const [open, setOpen] = useState<PanelId | null>(null);
  const yearChoices = useMemo(buildYearChoices, []);

  const toggle = (panel: PanelId) => setOpen((current) => (current === panel ? null : panel));
  const close = () => setOpen(null);

  const trimmedQuery = query.trim();
  const chips: FilterChip[] = [
    ...(trimmedQuery
      ? [{ key: "query", label: `Búsqueda: “${shorten(trimmedQuery, 22)}”`, onRemove: onClearQuery }]
      : []),
    ...filters.activeFilters(genres).map((filter) => ({
      key: filter.key,
      label: filter.label,
      onRemove: () => onChange(filter.remove(filters)),
    })),
  ];
  const clearAll = () => {
    onChange(CatalogFilters.DEFAULT);
    if (trimmedQuery) onClearQuery();
    close();
  };

  /** Menú del filtro abierto, que se despliega justo debajo de la fila de su botón. */
  const panelFor = (ids: readonly PanelId[]): ReactNode => {
    if (open === null || !ids.includes(open)) return null;

    let content: ReactNode;
    switch (open) {
      case "sort":
        content = (
          <View>
            <ChoiceList
              choices={SORT_CHOICES}
              selected={filters.sort}
              onSelect={(sort) => {
                onChange(filters.withSort(sort));
                close();
              }}
            />
            <AppText tone="dim" className="px-3 pb-2 pt-3 text-[10px] leading-[15px]">
              Por nombre se ordenan las películas ya cargadas (usa “Cargar más” para ampliar la
              lista). Valoración y estreno consideran películas con votos suficientes.
            </AppText>
          </View>
        );
        break;
      case "genre":
        content = (
          <GenreChecklist
            genres={genres}
            status={genresStatus}
            selected={filters.genreIds}
            match={filters.genreMatch}
            onToggle={(id) => onChange(filters.toggleGenre(id))}
            onClear={() => onChange(filters.clearGenres())}
            onMatchChange={(match) => onChange(filters.withGenreMatch(match))}
            onRetry={onRetryGenres}
            onDone={close}
          />
        );
        break;
      case "year":
        content = (
          <ChoiceList
            choices={yearChoices}
            selected={filters.year}
            columns={4}
            maxHeight={260}
            onSelect={(year) => {
              onChange(filters.withYear(year));
              close();
            }}
          />
        );
        break;
      case "rating":
        content = (
          <ChoiceList
            choices={RATING_CHOICES}
            selected={filters.minRating}
            onSelect={(rating) => {
              onChange(filters.withMinRating(rating));
              close();
            }}
          />
        );
        break;
    }

    return (
      <View className="mt-2 overflow-hidden rounded-[14px] border border-outline bg-[#1a1e1a] p-1">
        {content}
      </View>
    );
  };

  return (
    <View>
      <View className="flex-row gap-2">
        <FilterTrigger
          label="Ordenar por"
          value={filters.sortOption.summary}
          active={filters.sort !== "popular"}
          open={open === "sort"}
          onPress={() => toggle("sort")}
        />
        <FilterTrigger
          label="Género"
          value={genreSummary(filters, genres)}
          active={filters.genreIds.length > 0}
          open={open === "genre"}
          onPress={() => toggle("genre")}
        />
      </View>
      {panelFor(["sort", "genre"])}

      <View className="mt-2 flex-row gap-2">
        <FilterTrigger
          label="Año de estreno"
          value={filters.year === null ? "Todos" : String(filters.year)}
          active={filters.year !== null}
          open={open === "year"}
          onPress={() => toggle("year")}
        />
        <FilterTrigger
          label="Nota mínima"
          value={filters.minRating === null ? "Cualquiera" : `${filters.minRating}.0+`}
          active={filters.minRating !== null}
          open={open === "rating"}
          onPress={() => toggle("rating")}
        />
      </View>
      {panelFor(["year", "rating"])}

      <ActiveFilterChips chips={chips} onClearAll={clearAll} />
    </View>
  );
}
