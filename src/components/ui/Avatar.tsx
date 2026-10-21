import { View } from "react-native";
import { AppText } from "./AppText";

type AvatarSize = "tiny" | "small" | "large";

const SIZES: Record<AvatarSize, { box: string; text: string; border: string }> = {
  tiny: { box: "h-[26px] w-[26px]", text: "text-[8px]", border: "border" },
  small: { box: "h-[34px] w-[34px]", text: "text-[10px]", border: "border-2" },
  large: { box: "h-[66px] w-[66px]", text: "text-[17px]", border: "border-2" },
};

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
}

export function Avatar({ initials, size = "small" }: AvatarProps) {
  const style = SIZES[size];
  return (
    <View
      className={`items-center justify-center rounded-full border-lime/40 bg-[#edf5db] ${style.box} ${style.border}`}
    >
      <AppText tone="ink" font="heavy" className={style.text}>
        {initials}
      </AppText>
    </View>
  );
}
