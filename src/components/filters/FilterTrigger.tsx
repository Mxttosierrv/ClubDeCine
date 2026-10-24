import { Pressable, View } from "react-native";
import { palette } from "@/theme/palette";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";

interface FilterTriggerProps {
  /** Nombre del filtro ("Género"). */
  label: string;
  /** Valor actual ("Todos", "Acción +1"). */
  value: string;
  /** true si el filtro está aplicado (distinto del valor base). */
  active: boolean;
  /** true si su menú está desplegado. */
  open: boolean;
  onPress: () => void;
}

/** Botón que despliega el menú de un filtro y muestra su valor actual. */
export function FilterTrigger({ label, value, active, open, onPress }: FilterTriggerProps) {
  const border = open ? "border-lime bg-[#202a18]" : active ? "border-lime/50 bg-field" : "border-[#303530] bg-field";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      aria-expanded={open}
      onPress={onPress}
      className={`h-[52px] flex-1 flex-row items-center gap-2 rounded-[13px] border px-3 active:opacity-80 ${border}`}
    >
      <View className="min-w-0 flex-1">
        <AppText tone="dim" numberOfLines={1} className="text-[9px] leading-[12px]">
          {label}
        </AppText>
        <AppText
          tone={active ? "accent" : "soft"}
          font="bold"
          numberOfLines={1}
          className="mt-[2px] text-xs leading-[16px]"
        >
          {value}
        </AppText>
      </View>
      <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
        <Icon name="chevron-down" size={16} color={open || active ? palette.lime : palette.dim} />
      </View>
    </Pressable>
  );
}
