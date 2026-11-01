export type Tone =
  | "green"
  | "blue"
  | "purple"
  | "amber"
  | "pink"
  | "cyan"
  | "red"
  | "orange"
  | "gray"
  | "primary";

export const toneClass: Record<Tone, string> = {
  green: "k-tone-green",
  blue: "k-tone-blue",
  purple: "k-tone-purple",
  amber: "k-tone-amber",
  pink: "k-tone-pink",
  cyan: "k-tone-cyan",
  red: "k-tone-red",
  orange: "k-tone-orange",
  gray: "k-tone-gray",
  primary: "k-tone-primary",
};
