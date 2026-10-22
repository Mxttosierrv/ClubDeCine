import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette } from "@/theme/palette";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import type { Movie } from "@/models/Movie";
import { AppText } from "@/components/ui/AppText";
import { Poster } from "@/components/ui/Poster";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { TmdbAttribution } from "@/components/ui/TmdbAttribution";

interface MovieDetailsSheetProps {
  movie: Movie | null;
  saved: boolean;
  onAdd: (movie: Movie) => void;
  onClose: () => void;
}

interface DetailRow {
  label: string;
  value: string;
}

function DetailLine({ label, value }: DetailRow) {
  return (
    <View className="flex-row gap-3 border-b border-[#2e342e] py-[10px]">
      <AppText tone="dim" className="w-[96px] text-[11px]">
        {label}
      </AppText>
      <AppText tone="soft" className="flex-1 text-[11px]">
        {value}
      </AppText>
    </View>
  );
}

/** Solo se listan los datos que TMDB entregó; nada de filas vacías. */
function detailRows(movie: Movie): DetailRow[] {
  const rows: (DetailRow | null)[] = [
    movie.rating === null
      ? null
      : {
          label: "Puntuación",
          value:
            movie.voteCount === null
              ? `${movie.ratingLabel} / 10`
              : `${movie.ratingLabel} / 10 · ${movie.voteCount} votos`,
        },
    movie.releaseLabel ? { label: "Estreno", value: movie.releaseLabel } : null,
    movie.runtimeLabel ? { label: "Duración", value: movie.runtimeLabel } : null,
    movie.genres.length > 0 ? { label: "Géneros", value: movie.genres.join(", ") } : null,
    movie.director ? { label: "Director", value: movie.director } : null,
    movie.cast.length > 0 ? { label: "Reparto", value: movie.cast.join(", ") } : null,
  ];
  return rows.filter((row): row is DetailRow => row !== null);
}

/** Hoja inferior con la ficha completa de una película. */
export function MovieDetailsSheet({ movie: listed, saved, onAdd, onClose }: MovieDetailsSheetProps) {
  // El listado trae lo básico; la ficha completa agrega duración, director y reparto.
  const { movie, loading } = useMovieDetails(listed);
  const rows = movie ? detailRows(movie) : [];

  return (
    <Modal
      visible={movie !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/75">
        <Pressable accessibilityLabel="Cerrar" className="flex-1" onPress={onClose} />

        {movie ? (
          <View className="max-h-[88%] overflow-hidden rounded-t-[28px] border border-[#383e38] bg-[#1a1e1a]">
            <ScrollView bounces={false}>
              <View className="h-[245px]">
                <Poster uri={movie.backdrop ?? movie.poster} className="h-full w-full" iconSize={48} />
                <LinearGradient
                  colors={["rgba(26,30,26,0)", "#1a1e1a"]}
                  locations={[0.6, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View className="absolute left-1/2 top-[10px] h-1 w-[38px] -translate-x-[19px] rounded-full bg-[#555d55]" />
              </View>

              <View className="-mt-[30px] px-6 pb-[26px]">
                <View className="flex-row items-center gap-2">
                  <AppText tone="soft" className="text-xs">
                    {movie.yearLabel}
                  </AppText>
                  <AppText tone="soft" className="text-xs">
                    •
                  </AppText>
                  <AppText tone="soft" className="text-xs">
                    {movie.primaryGenre}
                  </AppText>
                  <ScoreBadge label={movie.ratingLabel} tier={movie.scoreTier} />
                </View>

                <AppText font="heavy" className="mt-[10px] text-[27px] leading-[30px] tracking-[-1px]">
                  {movie.title}
                </AppText>
                {movie.description ? (
                  <AppText tone="soft" className="mt-3 text-xs leading-[20px]">
                    {movie.description}
                  </AppText>
                ) : null}

                {rows.length > 0 ? (
                  <View className="mt-5">
                    {rows.map((row) => (
                      <DetailLine key={row.label} label={row.label} value={row.value} />
                    ))}
                  </View>
                ) : null}
                {loading ? (
                  <View className="mt-3 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color={palette.lime} />
                    <AppText tone="dim" className="text-[11px]">
                      Cargando director y reparto…
                    </AppText>
                  </View>
                ) : null}

                <PrimaryButton
                  className="mt-5"
                  icon={saved ? "check" : "plus"}
                  label={saved ? "Ya está en tu lista" : "Añadir a watchlist"}
                  onPress={() => onAdd(movie)}
                />
                <Pressable
                  accessibilityRole="link"
                  onPress={() => void Linking.openURL(movie.url).catch(() => undefined)}
                  className="mt-1 w-full p-3"
                >
                  <AppText tone="accent" font="bold" className="text-center text-[11px]">
                    Ver en TMDB
                  </AppText>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onClose} className="w-full p-3">
                  <AppText tone="muted" className="text-center text-[11px]">
                    Cerrar
                  </AppText>
                </Pressable>

                <View className="mt-2">
                  <TmdbAttribution compact />
                </View>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
