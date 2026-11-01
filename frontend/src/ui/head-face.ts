// Deterministic stand-in head for names the panel has no skin for.
// Ported from Kubek's shared/ui/player-head.tsx so both look identical.

const SKIN = ["#c98f62", "#e3b08a", "#8a5a3c", "#f0c9a4", "#b07850"];
const HAIR = ["#3a2618", "#6b4423", "#d9b54a", "#1d1d22", "#8c2f22", "#cfcfcf", "#4a3a8c"];
const EYE = ["#3b5bdb", "#2f7d4f", "#6b3e1f", "#444"];
const SHADE = "rgba(0,0,0,.18)";

export type HeadPixel = [x: number, y: number, w: number, h: number, fill: string];

const cache = new Map<string, HeadPixel[]>();

const hashName = (name: string) =>
  [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function generatedFacePixels(name: string): HeadPixel[] {
  const cached = cache.get(name);
  if (cached) return cached;

  const h = hashName(name);
  const pick = <T,>(list: T[], shift: number) => list[(h >> shift) % list.length];
  const skin = pick(SKIN, 1);
  const hair = pick(HAIR, 4);
  const eye = pick(EYE, 8);
  const fringe = (h >> 11) % 3;
  const mouth = (h >> 13) % 2 ? "#7a3f2a" : SHADE;

  const pixels: HeadPixel[] = [
    [0, 0, 8, 8, skin],
    [0, 0, 8, fringe === 2 ? 3 : 2, hair],
    [1, 4, 2, 1, "#fff"],
    [5, 4, 2, 1, "#fff"],
    [2, 4, 1, 1, eye],
    [5, 4, 1, 1, eye],
    [3, 5, 2, 1, SHADE],
    [2, 6, 4, 1, mouth],
  ];
  if (fringe === 1) pixels.splice(2, 0, [0, 2, 1, 2, hair], [7, 2, 1, 2, hair]);

  cache.set(name, pixels);
  return pixels;
}
