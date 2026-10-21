import { Pressable, View } from "react-native";
import { palette } from "@/theme/palette";
import type { Movie } from "@/models/Movie";
import { AppText } from "@/components/ui/AppText";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Poster } from "@/components/ui/Poster";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface RowButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}

function RowButton({ icon, label, onPress, disabled = false, danger = false }: RowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      className={`h-[31px] w-[31px] items-center justify-center rounded-[9px] border border-[#353b35] bg-[#272c27] active:opacity-70 ${
        disabled ? "opacity-35" : ""
      }`}
    >
      <Icon name={icon} size={17} color={danger ? palette.danger : "#b6bdb5"} />
    </Pressable>
  );
}

interface WatchRowProps {
  movie: Movie;
  position: number;
  /** Texto adicional bajo el título (por ejemplo, la fecha en que se vio). */
  trailing?: string;
  dimmed?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMarkWatched?: () => void;
  onRemove: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

/** Fila de la watchlist o de “Ya vistas”; las acciones disponibles dependen de las props. */
export function WatchRow({
  movie,
  position,
  trailing,
  dimmed = false,
  onMoveUp,
  onMoveDown,
  onMarkWatched,
  onRemove,
  isFirst = false,
  isLast = false,
}: WatchRowProps) {
  return (
    <View
      className={`min-h-[68px] flex-row items-center gap-2 rounded-[13px] border border-[#2d322d] bg-[#1d211d] p-2 ${
        dimmed ? "opacity-70" : ""
      }`}
    >
      <AppText tone="dim" font="bold" className="w-[17px] text-[9px]">
        {String(position).padStart(2, "0")}
      </AppText>
      <Poster uri={movie.poster} className="h-[51px] w-[42px] rounded-lg" iconSize={16} />

      <View className="min-w-0 flex-1">
        <AppText font="display" numberOfLines={1} className="text-[11px]">
          {movie.title}
        </AppText>
        <View className="mt-[6px] flex-row items-center gap-[5px]">
          <AppText tone="dim" numberOfLines={1} className="shrink text-[8px]">
            {movie.primaryGenre}
          </AppText>
          <AppText tone="dim" className="text-[8px]">
            •
          </AppText>
          <ScoreBadge value={movie.metascore} tier={movie.scoreTier} compact />
          {trailing ? (
            <>
              <AppText tone="dim" className="text-[8px]">
                •
              </AppText>
              <AppText tone="dim" numberOfLines={1} className="shrink text-[8px]">
                {trailing}
              </AppText>
            </>
          ) : null}
        </View>
      </View>

      <View className="flex-row gap-1">
        {onMoveUp ? (
          <RowButton icon="arrow-up" label="Subir" onPress={onMoveUp} disabled={isFirst} />
        ) : null}
        {onMoveDown ? (
          <RowButton icon="arrow-down" label="Bajar" onPress={onMoveDown} disabled={isLast} />
        ) : null}
        {onMarkWatched ? (
          <RowButton icon="check" label="Marcar como vista" onPress={onMarkWatched} />
        ) : null}
        <RowButton icon="trash" label="Eliminar" onPress={onRemove} danger />
      </View>
    </View>
  );
}
