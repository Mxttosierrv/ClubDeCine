import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "./AppText";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  children?: ReactNode;
  /** Variante grande, usada cuando reemplaza una pantalla completa. */
  large?: boolean;
}

export function EmptyState({ title, message, icon, children, large = false }: EmptyStateProps) {
  return (
    <View
      className={`items-center justify-center border border-dashed border-[#383e38] ${
        large ? "mt-8 min-h-[380px] rounded-[27px] p-[38px]" : "rounded-[13px] p-5"
      }`}
    >
      {icon}
      {title ? (
        <AppText font="display" className="mt-[18px] text-[21px]">
          {title}
        </AppText>
      ) : null}
      <AppText tone="dim" className={`text-center text-xs leading-[18px] ${title ? "mt-2" : ""}`}>
        {message}
      </AppText>
      {children}
    </View>
  );
}
