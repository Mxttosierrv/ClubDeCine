const { nativewindPreset } = require("./src/theme/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: nativewindPreset.colors,
      fontFamily: {
        sans: ["DMSans_400Regular"],
        "sans-bold": ["DMSans_700Bold"],
        display: ["Manrope_700Bold"],
        "display-xb": ["Manrope_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
