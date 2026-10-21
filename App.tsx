import "./global.css";

import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import { Manrope_800ExtraBold } from "@expo-google-fonts/manrope/800ExtraBold";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LibraryProvider } from "@/context/LibraryContext";
import { AppShell } from "@/navigation/AppShell";

// Se importa cada peso por separado para que solo se empaqueten las 4 fuentes usadas.
const FONTS = {
  DMSans_400Regular,
  DMSans_700Bold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  // Si una fuente falla, la app igualmente abre con la tipografía del sistema.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LibraryProvider>
        <AppShell />
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
