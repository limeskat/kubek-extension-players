export class SkinAvatarService {
  /**
   * Get 2D/3D skin avatar head icon URL for a player
   */
  getAvatarUrl(
    identifier: string,
    provider: "crafatar" | "minotar" | "mc-heads" | "visage" = "crafatar",
  ): string {
    const clean = encodeURIComponent(identifier.trim());
    if (!clean) {
      return "https://crafatar.com/avatars/steve?overlay=true&size=64";
    }

    switch (provider) {
      case "minotar":
        return `https://minotar.net/helm/${clean}/64.png`;
      case "mc-heads":
        return `https://mc-heads.net/avatar/${clean}/64`;
      case "visage":
        return `https://visage.surgeplay.com/face/64/${clean}`;
      case "crafatar":
      default:
        return `https://crafatar.com/avatars/${clean}?overlay=true&size=64`;
    }
  }
}
