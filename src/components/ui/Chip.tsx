import { Pressable } from "react-native";
import { AppText } from "./AppText";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Etiqueta seleccionable (filtros, orden y pestañas de listas). */
export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-full border px-3 py-2 ${
        active ? "border-[#eff7df] bg-[#eff7df]" : "border-[#343a34] bg-field"
      }`}
    >
      <AppText tone={active ? "ink" : "muted"} font={active ? "heavy" : "body"} className="text-[10px]">
        {label}
      </AppText>
    </Pressable>
  );
}
