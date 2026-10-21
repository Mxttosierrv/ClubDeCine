import { Pressable } from "react-native";
import { palette } from "@/theme/palette";
import { AppText } from "./AppText";
import { Icon, type IconName } from "./Icon";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  className?: string;
}

/** Botón de acción principal (verde lima) usado en tarjetas y hojas. */
export function PrimaryButton({ label, onPress, icon, className = "" }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-[14px] bg-lime p-[14px] active:opacity-80 ${className}`}
    >
      {icon ? <Icon name={icon} size={18} color={palette.ink} /> : null}
      <AppText tone="ink" font="heavy" className="text-sm">
        {label}
      </AppText>
    </Pressable>
  );
}
