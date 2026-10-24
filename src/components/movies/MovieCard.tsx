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

/** Los pósters de TMDB son 2:3: el recuadro tiene esa proporción para mostrarlos completos. */
const POSTER_ASPECT = 2 / 3;

/**
 * Tarjeta de la cuadrícula de películas. Todas miden lo mismo: el póster tiene
 * proporción fija y el título y la línea de datos tienen alto fijo, de modo que
 * el botón queda siempre en la misma posición. El área que abre los detalles y
 * el botón de añadir son hermanos (no anidados): en la web un botón dentro de
 * otro botón es HTML inválido.
 */
export function MovieCard({ movie, saved, onOpen, onAdd }: MovieCardProps) {
  const meta = `${movie.yearLabel} • ${movie.primaryGenre}`;

  return (
    <View className="flex-1 overflow-hidden rounded-[17px] border border-line bg-surface">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${movie.title}, ${meta}`}
        onPress={() => onOpen(movie)}
        className="active:opacity-90"
      >
        <View style={{ aspectRatio: POSTER_ASPECT }} className="w-full bg-raised">
          {/* "contain": la imagen se ve completa, sin recortes, aunque no sea 2:3. */}
          <Poster uri={movie.poster} resizeMode="contain" className="h-full w-full" iconSize={30} />
          <View className="absolute right-[10px] top-[10px]">
            <ScoreBadge label={movie.ratingLabel} tier={movie.scoreTier} />
          </View>
        </View>

        <View className="px-3 pt-3">
          {/* Alto fijo de dos líneas: un título corto no sube el botón. */}
          <View className="h-8">
            <AppText font="display" numberOfLines={2} className="text-[13px] leading-[16px]">
              {movie.title}
            </AppText>
          </View>
          <AppText tone="dim" numberOfLines={1} className="mt-[6px] text-[9px] leading-[12px]">
            {meta}
          </AppText>
        </View>
      </Pressable>

      <View className="px-3 pb-3 pt-[10px]">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "En tu lista" : `Añadir ${movie.title} a watchlist`}
          onPress={() => onAdd(movie)}
          disabled={saved}
          className="h-[34px] flex-row items-center justify-center gap-[5px] rounded-[9px] border border-outline bg-raised active:opacity-80"
        >
          <Icon name={saved ? "check" : "plus"} size={17} color={saved ? palette.lime : "#d6dbd4"} />
          <AppText tone={saved ? "accent" : "soft"} font="bold" className="text-[10px]">
            {saved ? "En tu lista" : "Añadir a watchlist"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
