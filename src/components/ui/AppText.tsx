import { Text, type TextProps } from "react-native";

const TONES = {
  default: "text-text",
  soft: "text-soft",
  muted: "text-muted",
  dim: "text-dim",
  accent: "text-lime",
  ink: "text-ink",
  danger: "text-danger",
} as const;

const FONTS = {
  body: "font-sans",
  bold: "font-sans-bold",
  display: "font-display",
  heavy: "font-display-xb",
} as const;

export interface AppTextProps extends TextProps {
  tone?: keyof typeof TONES;
  font?: keyof typeof FONTS;
  className?: string;
}

/**
 * Texto con la tipografía y los colores de la marca. React Native no hereda
 * color ni fuente entre componentes, así que se definen aquí una sola vez.
 */
export function AppText({
  tone = "default",
  font = "body",
  className = "",
  ...props
}: AppTextProps) {
  return <Text {...props} className={`${TONES[tone]} ${FONTS[font]} ${className}`} />;
}
