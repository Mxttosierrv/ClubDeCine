import { Pressable, View } from "react-native";
import { palette } from "@/theme/palette";
import type { Movie } from "@/models/Movie";
import { AppText } from "@/components/ui/AppText";
import { Icon } from "@/components/ui/Icon";
import { Poster } from "@/components/ui/Poster";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface MovieCardProps {
  movie: Movie;
  saved: boolean;
  onOpen: (movie: Movie) => void;
  onAdd: (movie: Movie) => void;
}

/** Tarjeta de la cuadrícula de películas. */
export function MovieCard({ movie, saved, onOpen, onAdd }: MovieCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={movie.title}
      onPress={() => onOpen(movie)}
      className="flex-1 overflow-hidden rounded-[17px] border border-line bg-surface active:opacity-90"
    >
      <View className="h-[165px]">
        <Poster uri={movie.poster} className="h-full w-full" iconSize={30} />
        <View className="absolute right-[10px] top-[10px]">
          <ScoreBadge value={movie.metascore} tier={movie.scoreTier} />
        </View>
      </View>

      <View className="p-3">
        <View className="flex-row items-start justify-between gap-[5px]">
          <AppText font="display" numberOfLines={2} className="flex-1 text-[13px] leading-[16px]">
            {movie.title}
          </AppText>
          <AppText tone="dim" className="text-[9px]">
            {movie.yearLabel}
          </AppText>
        </View>

        <AppText tone="dim" numberOfLines={1} className="mt-[7px] text-[9px]">
          {movie.primaryGenre} • IMDb {movie.imdbLabel}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={() => onAdd(movie)}
          disabled={saved}
          className="mt-[11px] h-[34px] flex-row items-center justify-center gap-[5px] rounded-[9px] border border-outline bg-raised active:opacity-80"
        >
          <Icon name={saved ? "check" : "plus"} size={17} color={saved ? palette.lime : "#d6dbd4"} />
          <AppText tone={saved ? "accent" : "soft"} font="bold" className="text-[10px]">
            {saved ? "En tu lista" : "Añadir a watchlist"}
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}
