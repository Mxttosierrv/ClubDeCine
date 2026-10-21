/**
 * Única fuente de verdad de los colores de Framelist.
 * Es CommonJS (.js) para que `tailwind.config.js` pueda leerla y, a la vez,
 * TypeScript la consuma con los tipos de `palette.d.ts`.
 */
const palette = {
  canvas: "#111311",
  frame: "#161916",
  surface: "#1c201c",
  field: "#202420",
  raised: "#292e29",
  line: "#2e332e",
  outline: "#3a4039",
  ink: "#171a16",
  text: "#f3f0e8",
  soft: "#c5c9c3",
  muted: "#858c85",
  dim: "#747b74",
  lime: "#c7f46d",
  gold: "#f1d86b",
  ember: "#ef9d68",
  danger: "#f3897c",
};

module.exports = {
  palette,
  nativewindPreset: { colors: palette },
};
