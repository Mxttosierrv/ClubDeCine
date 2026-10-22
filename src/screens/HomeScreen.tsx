import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { palette } from "@/theme/palette";
import { useLibrary } from "@/context/LibraryContext";
import { DEFAULT_PROFILE } from "@/models/UserProfile";
import type { AppRoute } from "@/navigation/routes";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Poster } from "@/components/ui/Poster";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

interface HomeScreenProps {
  onNavigate: (route: AppRoute) => void;
}

/** Inicio: destaca la primera película de la watchlist. */
export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { library } = useLibrary();
  const featured = library.featured;

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-[21px] pb-6 pt-[34px]">
      <AppText tone="accent" font="heavy" className="mb-2 text-[10px] tracking-[1.8px]">
        TU ELECCIÓN
      </AppText>
      <AppText font="display" className="text-[31px] leading-[34px] tracking-[-1.5px]">
        ¿Qué vemos hoy?
      </AppText>
      <AppText tone="muted" className="mt-2 text-sm">
        Tu próxima gran historia está lista.
      </AppText>

      {featured ? (
        <View className="mt-8 h-[480px] overflow-hidden rounded-[27px] border border-[#383c37] bg-surface">
          <Poster uri={featured.poster} className="h-full w-full" iconSize={56} />
          <LinearGradient
            colors={["rgba(8,10,8,0.05)", "rgba(8,10,8,0.05)", "rgba(8,10,8,0.94)"]}
            locations={[0, 0.25, 0.87]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View className="absolute left-[18px] top-[18px] flex-row items-center gap-2 rounded-full bg-[#101310]/80 py-[5px] pl-[5px] pr-[10px]">
            <Avatar initials={DEFAULT_PROFILE.initials} size="tiny" />
            <AppText tone="soft" className="text-[11px]">
              Elegida por ti
            </AppText>
          </View>

          <View className="absolute inset-x-[22px] bottom-[22px]">
            <View className="flex-row items-center gap-2">
              <AppText tone="soft" className="text-xs">
                {featured.yearLabel}
              </AppText>
              <AppText tone="soft" className="text-xs">
                •
              </AppText>
              <AppText tone="soft" className="text-xs">
                {featured.primaryGenre}
              </AppText>
              <ScoreBadge label={featured.ratingLabel} tier={featured.scoreTier} />
            </View>
            <AppText font="display" className="mb-[7px] mt-[9px] text-[30px] leading-[33px] tracking-[-1.2px]">
              {featured.title}
            </AppText>
            {featured.description ? (
              <AppText tone="soft" numberOfLines={4} className="text-[13px] leading-[19px]">
                {featured.description}
              </AppText>
            ) : null}
            <PrimaryButton
              className="mt-5"
              icon="list"
              label="Ver mi watchlist"
              onPress={() => onNavigate("profile")}
            />
          </View>
        </View>
      ) : (
        <EmptyState
          large
          icon={<Icon name="film" size={30} color={palette.muted} />}
          title="Tu cartelera está vacía"
          message="Añade una película a tu watchlist para verla aquí."
        >
          <PrimaryButton
            className="mt-5 self-stretch"
            label="Explorar películas"
            onPress={() => onNavigate("movies")}
          />
        </EmptyState>
      )}

      <View className="mt-5 flex-row items-center justify-center gap-2">
        <Icon name="list" size={18} color={palette.dim} />
        <AppText tone="dim" className="text-[11px]">
          Mostrando la primera película de tu watchlist
        </AppText>
      </View>
    </ScrollView>
  );
}
