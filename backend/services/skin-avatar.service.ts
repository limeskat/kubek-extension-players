export type AvatarProvider = "crafatar" | "minotar" | "mc-heads" | "visage";

export class SkinAvatarService {
  constructor(
    private readonly getProvider: () => AvatarProvider = () => "mc-heads",
  ) {}

  /**
   * Get 2D/3D skin avatar head icon URL for a player
   */
  getAvatarUrl(identifier: string, provider?: AvatarProvider): string {
    const clean = encodeURIComponent(identifier.trim());
    if (!clean) {
      return "https://mc-heads.net/avatar/MHF_Steve/64";
    }

    switch (provider ?? this.getProvider()) {
      case "minotar":
        return `https://minotar.net/helm/${clean}/64.png`;
      case "mc-heads":
        return `https://mc-heads.net/avatar/${clean}/64`;
      case "visage":
        return `https://visage.surgeplay.com/face/64/${clean}`;
      case "crafatar":
        return `https://crafatar.com/avatars/${clean}?overlay=true&size=64`;
      default:
        return `https://mc-heads.net/avatar/${clean}/64`;
    }
  }
}
