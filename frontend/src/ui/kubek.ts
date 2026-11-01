/** Reads the host surface installed by the panel. Never throws, never caches. */
export function useKubek(): any {
  return typeof window === "undefined" ? undefined : (window as any).Kubek;
}
