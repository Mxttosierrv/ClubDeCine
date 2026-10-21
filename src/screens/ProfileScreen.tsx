import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { palette } from "@/theme/palette";
import { useLibrary } from "@/context/LibraryContext";
import { DEFAULT_PROFILE } from "@/models/UserProfile";
import { WatchRow } from "@/components/movies/WatchRow";
import { AppText } from "@/components/ui/AppText";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";

type ProfileTab = "watchlist" | "watched";

interface TabButtonProps {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, count, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center gap-[7px] rounded-[10px] py-[10px] ${
        active ? "bg-lime" : ""
      }`}
    >
      <AppText tone={active ? "ink" : "muted"} font="bold" className="text-[13px]">
        {label}
      </AppText>
      <View className={`rounded-full px-[7px] py-[2px] ${active ? "bg-black/15" : "bg-raised"}`}>
        <AppText tone={active ? "ink" : "muted"} className="text-[10px]">
          {count}
        </AppText>
      </View>
    </Pressable>
  );
}

/** Perfil: watchlist (con orden, listas y “marcar como vista”) y películas ya vistas. */
export function ProfileScreen() {
  const { library, removeFromWatchlist, markWatched, removeWatched, moveMovie, createList } =
    useLibrary();
  const [tab, setTab] = useState<ProfileTab>("watchlist");
  const [newList, setNewList] = useState("");

  const submitList = () => {
    createList(newList);
    setNewList("");
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-[21px] pb-6 pt-[34px]"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row items-center gap-4">
        <Avatar initials={DEFAULT_PROFILE.initials} size="large" />
        <View className="flex-1">
          <AppText tone="accent" font="heavy" className="mb-2 text-[10px] tracking-[1.8px]">
            MI PERFIL
          </AppText>
          <AppText font="display" className="text-[25px] leading-[28px] tracking-[-1.5px]">
            {DEFAULT_PROFILE.displayName}
          </AppText>
          <AppText tone="muted" className="mt-[5px] text-[11px]">
            {DEFAULT_PROFILE.tagline} · {library.totalSaved} películas guardadas
          </AppText>
        </View>
      </View>

      <View className="my-[25px] h-px bg-[#303430]" />

      <View className="mb-5 mt-1 flex-row gap-1 rounded-[14px] bg-surface p-1" accessibilityRole="tablist">
        <TabButton
          label="Watchlist"
          count={library.watchlist.length}
          active={tab === "watchlist"}
          onPress={() => setTab("watchlist")}
        />
        <TabButton
          label="Ya vistas"
          count={library.watched.length}
          active={tab === "watched"}
          onPress={() => setTab("watched")}
        />
      </View>

      {tab === "watchlist" ? (
        <View>
          <View className="flex-row items-center justify-between">
            <View>
              <AppText font="display" className="text-lg tracking-[-0.5px]">
                Mis watchlists
              </AppText>
              <AppText tone="muted" className="mt-1 text-[11px]">
                Organiza lo próximo que quieres ver.
              </AppText>
            </View>
            <Icon name="list" color={palette.lime} />
          </View>

          <View className="mt-[17px] h-[43px] flex-row rounded-xl border border-dashed border-[#3e453d] pl-[13px]">
            <TextInput
              value={newList}
              onChangeText={setNewList}
              onSubmitEditing={submitList}
              placeholder="Nombre de una nueva lista"
              placeholderTextColor="#6f756f"
              returnKeyType="done"
              className="min-w-0 flex-1 font-sans text-[13px] text-text"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Crear lista"
              onPress={submitList}
              className="w-[43px] items-center justify-center"
            >
              <Icon name="plus" size={19} color={palette.lime} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="my-[13px] grow-0"
            contentContainerClassName="gap-2"
          >
            {library.lists.map((list, index) => (
              <Chip key={list} label={list} active={index === 0} />
            ))}
          </ScrollView>

          <View className="gap-2">
            {library.watchlist.length === 0 ? (
              <EmptyState message="Tu lista está vacía. Descubre algo nuevo en Películas." />
            ) : null}
            {library.watchlist.map((movie, index) => (
              <WatchRow
                key={movie.id}
                movie={movie}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === library.watchlist.length - 1}
                onMoveUp={() => moveMovie(movie.id, "up")}
                onMoveDown={() => moveMovie(movie.id, "down")}
                onMarkWatched={() => markWatched(movie.id)}
                onRemove={() => removeFromWatchlist(movie.id)}
              />
            ))}
          </View>
        </View>
      ) : (
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <AppText font="display" className="text-lg tracking-[-0.5px]">
              Ya vistas
            </AppText>
            <View className="h-[21px] w-[21px] items-center justify-center rounded-full bg-raised">
              <AppText tone="muted" className="text-[9px]">
                {library.watched.length}
              </AppText>
            </View>
          </View>

          <View className="gap-2">
            {library.watched.length === 0 ? (
              <EmptyState message="Aún no has marcado películas como vistas." />
            ) : null}
            {library.watched.map((entry, index) => (
              <WatchRow
                key={entry.id}
                movie={entry.movie}
                position={index + 1}
                trailing={entry.watchedLabel}
                dimmed
                onRemove={() => removeWatched(entry.id)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
