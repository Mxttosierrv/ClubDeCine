/** Datos del usuario que se muestran en la app. */
export class UserProfile {
  constructor(
    readonly displayName: string,
    readonly tagline: string,
  ) {}

  /** Iniciales para el avatar: "Alejandra M." → "AM". */
  get initials(): string {
    const letters = this.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase());
    return letters.join("") || "?";
  }
}

export const DEFAULT_PROFILE = new UserProfile("Alejandra M.", "Amante del cine");
