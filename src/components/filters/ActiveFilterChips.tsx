import { Pressable, View } from "react-native";
import { palette } from "@/theme/palette";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: readonly FilterChip[];
  /** Quita todos los filtros; se ofrece solo cuando hay dos o más. */
  onClearAll: () => void;
}

/** Filtros aplicados como botones con una "x" a la izquierda: al tocarlos se quitan. */
export function ActiveFilterChips({ chips, onClearAll }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <View className="mt-3 flex-row flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={`Quitar filtro ${chip.label}`}
          onPress={chip.onRemove}
          hitSlop={4}
          className="max-w-full flex-row items-center gap-[6px] rounded-full border border-lime/50 bg-[#202a18] py-[7px] pl-[9px] pr-3 active:opacity-70"
        >
          <Icon name="x" size={12} color={palette.lime} />
          <AppText tone="soft" font="bold" numberOfLines={1} className="shrink text-[10px]">
            {chip.label}
          </AppText>
        </Pressable>
      ))}
      {chips.length >= 2 ? (
        <Pressable accessibilityRole="button" onPress={onClearAll} hitSlop={8} className="px-1 py-[7px]">
          <AppText tone="muted" font="bold" className="text-[10px] underline">
            Limpiar todo
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
