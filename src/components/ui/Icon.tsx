import type { ReactNode } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { palette } from "@/theme/palette";

export type IconName =
  | "home"
  | "film"
  | "user"
  | "search"
  | "plus"
  | "check"
  | "trash"
  | "list"
  | "spark"
  | "arrow-up"
  | "arrow-down";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const GLYPHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <Path d="m3 11 9-8 9 8" />
      <Path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  film: (
    <>
      <Rect x="3" y="4" width="18" height="16" rx="2" />
      <Path d="M7 4v16M17 4v16M3 9h4m10 0h4M3 15h4m10 0h4" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="m20 20-4-4" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  check: <Path d="m5 12 4 4L19 6" />,
  trash: <Path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6m4-6v6" />,
  list: (
    <>
      <Path d="M9 6h12M9 12h12M9 18h12" />
      <Path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth={3} />
    </>
  ),
  spark: <Path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" />,
  "arrow-up": <Path d="m6 15 6-6 6 6" />,
  "arrow-down": <Path d="m6 9 6 6 6-6" />,
};

/** Íconos de trazo dibujados con SVG, tomados del diseño de Figma. */
export function Icon({ name, size = 22, color = palette.text }: IconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[name]}
    </Svg>
  );
}
