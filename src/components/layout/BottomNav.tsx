import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "@/theme/palette";
import type { AppRoute } from "@/navigation/routes";
import { AppText } from "@/components/ui/AppText";
import { Icon, type IconName } from "@/components/ui/Icon";

interface BottomNavProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

interface NavItem {
  route: AppRoute;
  label: string;
  icon: IconName;
}

const ITEMS: NavItem[] = [
  { route: "profile", label: "Perfil", icon: "user" },
  { route: "home", label: "Inicio", icon: "home" },
  { route: "movies", label: "Películas", icon: "film" },
];

export function BottomNav({ route, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="flex-row items-center border-t border-[#323732] bg-[#191d19] px-[25px] pt-[5px]"
    >
      {ITEMS.map((item) => {
        const active = route === item.route;
        const isHome = item.route === "home";
        const color = active ? palette.lime : isHome ? "#9da49c" : "#777f77";

        return (
          <Pressable
            key={item.route}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => onNavigate(item.route)}
            className={`h-[62px] flex-1 items-center justify-center ${isHome ? "-translate-y-[13px] gap-[3px]" : "gap-[5px]"}`}
          >
            {isHome ? (
              <View className="h-[54px] w-[54px] items-center justify-center rounded-[18px] bg-lime">
                <Icon name="home" size={25} color="#192015" />
              </View>
            ) : (
              <Icon name={item.icon} color={color} />
            )}
            <AppText
              font="bold"
              className="text-[9px]"
              style={{ color }}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
