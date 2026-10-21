export type PaletteKey =
  | "canvas"
  | "frame"
  | "surface"
  | "field"
  | "raised"
  | "line"
  | "outline"
  | "ink"
  | "text"
  | "soft"
  | "muted"
  | "dim"
  | "lime"
  | "gold"
  | "ember"
  | "danger";

export const palette: Record<PaletteKey, string>;
export const nativewindPreset: { colors: Record<PaletteKey, string> };
