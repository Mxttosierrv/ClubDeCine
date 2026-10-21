import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Movie } from "@/models/Movie";
import { AppText } from "@/components/ui/AppText";
import { Poster } from "@/components/ui/Poster";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface MovieDetailsSheetProps {
  movie: Movie | null;
  saved: boolean;
  onAdd: (movie: Movie) => void;
  onClose: () => void;
}

interface CreditRowProps {
  label: string;
  value: string;
}

function CreditRow({ label, value }: CreditRowProps) {
  return (
    <View className="flex-row gap-3 border-b border-[#2e342e] py-[10px]">
      <AppText tone="dim" className="w-[82px] text-[11px]">
        {label}
      </AppText>
      <AppText tone="soft" className="flex-1 text-[11px]">
        {value}
      </AppText>
    </View>
  );
}

/** Hoja inferior con la ficha completa de una película. */
export function MovieDetailsSheet({ movie, saved, onAdd, onClose }: MovieDetailsSheetProps) {
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
                <Poster uri={movie.poster} className="h-full w-full" iconSize={48} />
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
                  <ScoreBadge value={movie.metascore} tier={movie.scoreTier} />
                </View>

                <AppText font="heavy" className="mt-[10px] text-[27px] leading-[30px] tracking-[-1px]">
                  {movie.title}
                </AppText>
                {movie.plot ? (
                  <AppText tone="soft" className="mt-3 text-xs leading-[20px]">
                    {movie.plot}
                  </AppText>
                ) : null}

                <View className="mt-5">
                  <CreditRow label="Director" value={movie.director ?? "—"} />
                  <CreditRow label="Guionista" value={movie.writer ?? "—"} />
                  <CreditRow
                    label="Reparto"
                    value={movie.cast.length > 0 ? movie.cast.join(", ") : "—"}
                  />
                  <CreditRow label="Metascore" value={movie.hasMetascore ? `${movie.metascore} / 100` : "Sin reseñas"} />
                  <CreditRow label="IMDb" value={movie.imdbRating === null ? "—" : `${movie.imdbLabel} / 10`} />
                </View>

                <PrimaryButton
                  className="mt-5"
                  icon={saved ? "check" : "plus"}
                  label={saved ? "Ya está en tu lista" : "Añadir a watchlist"}
                  onPress={() => onAdd(movie)}
                />
                <Pressable accessibilityRole="button" onPress={onClose} className="mt-1 w-full p-3">
                  <AppText tone="muted" className="text-center text-[11px]">
                    Cerrar
                  </AppText>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
