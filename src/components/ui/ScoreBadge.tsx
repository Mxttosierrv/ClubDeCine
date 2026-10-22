import { View } from "react-native";
import type { ScoreTier } from "@/models/Movie";
import { AppText } from "./AppText";

const TIER_BACKGROUND: Record<ScoreTier, string> = {
  high: "bg-lime",
  mixed: "bg-gold",
  low: "bg-ember",
  none: "bg-raised",
};

interface ScoreBadgeProps {
  /** Texto de la nota, por ejemplo "7.8" o "–" si no existe. */
  label: string;
  tier: ScoreTier;
  compact?: boolean;
}

/** Insignia con la puntuación de TMDB, coloreada según su nivel. */
export function ScoreBadge({ label, tier, compact = false }: ScoreBadgeProps) {
  const size = compact ? "h-[18px] min-w-[21px] rounded px-1" : "h-6 min-w-[27px] rounded-md px-[5px]";
  return (
    <View className={`items-center justify-center ${size} ${TIER_BACKGROUND[tier]}`}>
      <AppText
        tone={tier === "none" ? "muted" : "ink"}
        font="heavy"
        className={compact ? "text-[8px]" : "text-[10px]"}
      >
        {label}
      </AppText>
    </View>
  );
}
