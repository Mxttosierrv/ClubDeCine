import { Pressable, ScrollView, View } from "react-native";
import { palette } from "@/theme/palette";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";

export interface Choice<T> {
  value: T;
  label: string;
  /** Encabezado que agrupa varias opciones; se muestra al cambiar de sección. */
  section?: string | null;
}

interface ChoiceListProps<T> {
  choices: readonly Choice<T>[];
  selected: T;
  onSelect: (value: T) => void;
  /** Más de una columna muestra las opciones como botones compactos (por ejemplo, años). */
  columns?: number;
  /** Alto máximo antes de que la lista se desplace; sin valor, se muestra completa. */
  maxHeight?: number;
}

/** Lista de selección única (una opción a la vez) para el menú de un filtro. */
export function ChoiceList<T extends string | number | null>({
  choices,
  selected,
  onSelect,
  columns = 1,
  maxHeight,
}: ChoiceListProps<T>) {
  const compact = columns > 1;
  let lastSection: string | null | undefined;

  const rows = (
    <>
      {choices.map((choice) => {
        const active = choice.value === selected;
        const showSection = !compact && choice.section && choice.section !== lastSection;
        lastSection = choice.section ?? lastSection;

        return (
          <View key={String(choice.value)} style={compact ? { width: `${100 / columns}%`, padding: 3 } : undefined}>
            {showSection ? (
              <AppText tone="dim" font="bold" className="mb-1 mt-3 px-3 text-[9px] tracking-[1.2px]">
                {choice.section?.toUpperCase()}
              </AppText>
            ) : null}
            <Pressable
              accessibilityRole="radio"
              aria-checked={active}
              onPress={() => onSelect(choice.value)}
              className={
                compact
                  ? `h-9 items-center justify-center rounded-[10px] border active:opacity-80 ${
                      active ? "border-lime bg-lime" : "border-[#343a34] bg-field"
                    }`
                  : `min-h-[40px] flex-row items-center justify-between gap-3 rounded-[10px] px-3 active:opacity-80 ${
                      active ? "bg-[#202a18]" : ""
                    }`
              }
            >
              <AppText
                tone={compact ? (active ? "ink" : "soft") : active ? "accent" : "soft"}
                font={active ? "bold" : "body"}
                numberOfLines={1}
                className={compact ? "text-[11px]" : "flex-1 text-xs"}
              >
                {choice.label}
              </AppText>
              {!compact && active ? <Icon name="check" size={16} color={palette.lime} /> : null}
            </Pressable>
          </View>
        );
      })}
    </>
  );
  const wrap = compact ? ({ flexDirection: "row", flexWrap: "wrap" } as const) : undefined;

  // Sin tope de alto es una vista normal (el scroll es el de la pantalla); con tope, se desplaza sola.
  return maxHeight === undefined ? (
    <View style={wrap}>{rows}</View>
  ) : (
    <ScrollView
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      style={{ maxHeight }}
      contentContainerStyle={wrap}
    >
      {rows}
    </ScrollView>
  );
}
