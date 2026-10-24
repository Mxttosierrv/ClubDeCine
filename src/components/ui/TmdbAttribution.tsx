import { Linking, Pressable, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { TMDB_LOGO_ASPECT, TMDB_LOGO_SVG } from "@/config/tmdbLogo";
import { AppText } from "./AppText";

/** Aviso exigido por TMDB; se muestra en inglés, tal como lo piden sus condiciones. */
export const TMDB_NOTICE = "This product uses the TMDB API but is not endorsed or certified by TMDB.";

const TMDB_URL = "https://www.themoviedb.org";

/** Ancho del logo: más discreto que el logo de Framelist, como exige TMDB. */
const LOGO_WIDTH = 110;

interface TmdbAttributionProps {
  /** Versión de una línea para pies de pantalla; la completa va en Créditos. */
  compact?: boolean;
}

/** Atribución de TMDB como fuente de los datos y las imágenes. */
export function TmdbAttribution({ compact = false }: TmdbAttributionProps) {
  if (compact) {
    return (
      <AppText tone="dim" className="text-center text-[9px] leading-[14px]">
        {TMDB_NOTICE}
      </AppText>
    );
  }

  return (
    <View className="rounded-[13px] border border-[#2d322d] bg-[#1d211d] p-4">
      <View accessible accessibilityLabel="TMDB" className="mb-3 self-start">
        <SvgXml
          xml={TMDB_LOGO_SVG}
          width={LOGO_WIDTH}
          height={LOGO_WIDTH / TMDB_LOGO_ASPECT}
        />
      </View>
      <AppText tone="soft" className="text-[11px] leading-[17px]">
        Los datos, las imágenes y las puntuaciones de las películas provienen de TMDB.
      </AppText>
      <AppText tone="muted" className="mt-2 text-[11px] leading-[17px]">
        {TMDB_NOTICE}
      </AppText>
      <Pressable
        accessibilityRole="link"
        onPress={() => void Linking.openURL(TMDB_URL).catch(() => undefined)}
        className="mt-3 self-start"
      >
        <AppText tone="accent" font="bold" className="text-[11px]">
          themoviedb.org
        </AppText>
      </Pressable>
    </View>
  );
}
