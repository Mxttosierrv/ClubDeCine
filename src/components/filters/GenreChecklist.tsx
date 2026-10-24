import { ActivityIndicator, Pressable, View } from "react-native";
import { palette } from "@/theme/palette";
import type { GenreMatch } from "@/models/CatalogFilters";
import type { Genre } from "@/models/Genre";
import type { GenresStatus } from "@/hooks/useGenres";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface GenreChecklistProps {
  genres: readonly Genre[];
  status: GenresStatus;
  selected: readonly number[];
  match: GenreMatch;
  onToggle: (id: number) => void;
  onClear: () => void;
  onMatchChange: (match: GenreMatch) => void;
  onRetry: () => void;
  onDone: () => void;
}

const MATCH_OPTIONS: { value: GenreMatch; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "any", label: "Cualquiera" },
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      className={`h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${
        checked ? "border-lime bg-lime" : "border-[#4a514a] bg-transparent"
      }`}
    >
      {checked ? <Icon name="check" size={13} color={palette.ink} /> : null}
    </View>
  );
}

/** Lista de géneros con casillas para elegir varios a la vez. */
export function GenreChecklist({
  genres,
  status,
  selected,
  match,
  onToggle,
  onClear,
  onMatchChange,
  onRetry,
  onDone,
}: GenreChecklistProps) {
  if (status === "loading") {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color={palette.lime} />
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="items-center p-3">
        <AppText tone="muted" className="text-center text-xs leading-[18px]">
          No se pudo cargar la lista de géneros.
        </AppText>
        <PrimaryButton className="mt-3 self-stretch" label="Reintentar" onPress={onRetry} />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between px-3 pb-1 pt-2">
        <AppText tone="dim" className="text-[11px]">
          {selected.length === 0
            ? "Elige uno o varios"
            : `${selected.length} ${selected.length === 1 ? "elegido" : "elegidos"}`}
        </AppText>
        {selected.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={onClear} hitSlop={8}>
            <AppText tone="accent" font="bold" className="text-[11px]">
              Borrar selección
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {/* Sin scroll propio: las casillas se ven todas y la pantalla se desplaza. */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {genres.map((genre) => {
          const checked = selected.includes(genre.id);
          return (
            <Pressable
              key={genre.id}
              accessibilityRole="checkbox"
              aria-checked={checked}
              onPress={() => onToggle(genre.id)}
              style={{ width: "50%" }}
              className="min-h-[40px] flex-row items-center gap-[10px] rounded-[10px] px-3 active:opacity-80"
            >
              <Checkbox checked={checked} />
              <AppText
                tone={checked ? "accent" : "soft"}
                font={checked ? "bold" : "body"}
                numberOfLines={1}
                className="min-w-0 flex-1 text-xs"
              >
                {genre.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {selected.length >= 2 ? (
        <View className="mx-3 mt-2 border-t border-[#2e342e] pt-3">
          <AppText tone="dim" className="mb-2 text-[11px]">
            La película debe tener
          </AppText>
          <View className="flex-row gap-1 rounded-[11px] bg-surface p-1">
            {MATCH_OPTIONS.map((option) => {
              const active = option.value === match;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  aria-checked={active}
                  onPress={() => onMatchChange(option.value)}
                  className={`h-8 flex-1 items-center justify-center rounded-[8px] ${active ? "bg-lime" : ""}`}
                >
                  <AppText tone={active ? "ink" : "muted"} font="bold" className="text-[11px]">
                    {option.value === "all" ? "Todos los géneros" : "Alguno de ellos"}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="px-3 pb-2 pt-3">
        <PrimaryButton label="Listo" onPress={onDone} />
      </View>
    </View>
  );
}
