import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "@/theme/palette";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

interface TopBarProps {
  initials: string;
}

export function TopBar({ initials }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-[#292d29] bg-frame px-[22px]"
    >
      <View className="h-[70px] flex-row items-center">
        <View className="mr-[9px] h-[31px] w-[31px] items-center justify-center rounded-[9px] bg-lime">
          <Icon name="spark" size={18} color={palette.ink} />
        </View>
        <AppText font="heavy" className="text-[19px] tracking-[-0.8px]">
          Frame<AppText tone="accent" font="heavy" className="text-[19px] tracking-[-0.8px]">list</AppText>
        </AppText>
        <View className="ml-auto">
          <Avatar initials={initials} size="small" />
        </View>
      </View>
    </View>
  );
}
