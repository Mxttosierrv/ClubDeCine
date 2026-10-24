import { useEffect, useState } from "react";
import { Image, View, type ImageProps } from "react-native";
import { palette } from "@/theme/palette";
import { Icon } from "./Icon";

interface PosterProps {
  uri: string | null;
  className?: string;
  iconSize?: number;
  /** "cover" rellena el espacio recortando; "contain" muestra la imagen completa. */
  resizeMode?: ImageProps["resizeMode"];
}

/** Imagen del póster con un marcador de posición si no existe o falla al cargar. */
export function Poster({ uri, className = "", iconSize = 24, resizeMode = "cover" }: PosterProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View className={`items-center justify-center bg-raised ${className}`}>
        <Icon name="film" size={iconSize} color={palette.dim} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
      accessible={false}
      className={className}
    />
  );
}
