import { useState } from "react";
import { View } from "react-native";
import { DEFAULT_PROFILE } from "@/models/UserProfile";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { HomeScreen } from "@/screens/HomeScreen";
import { MoviesScreen } from "@/screens/MoviesScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import type { AppRoute } from "./routes";

/** Estructura fija de la app (barra superior + pantalla activa + navegación inferior). */
export function AppShell() {
  const [route, setRoute] = useState<AppRoute>("home");

  return (
    <View className="flex-1 bg-frame">
      <TopBar initials={DEFAULT_PROFILE.initials} />
      <View className="flex-1">
        {route === "home" && <HomeScreen onNavigate={setRoute} />}
        {route === "movies" && <MoviesScreen />}
        {route === "profile" && <ProfileScreen />}
      </View>
      <BottomNav route={route} onNavigate={setRoute} />
    </View>
  );
}
