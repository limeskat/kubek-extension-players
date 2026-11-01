// Flat model loading for item icons: merges a model with its parents so the icon
// renderer has every element list, texture variable and parent override in one object.

export type ModelFace = {
  texture?: string;
  uv?: [number, number, number, number];
  tintindex?: number;
};

export type ModelElement = {
  from: [number, number, number];
  to: [number, number, number];
  rotation?: { origin: [number, number, number]; axis: "x" | "y" | "z"; angle: number };
  faces?: Record<string, ModelFace>;
};

export type FlatModel = {
  textures: Record<string, string>;
  elements: ModelElement[];
};

import { ASSET_CDN } from "./item-textures";

export type JsonFetcher = (url: string) => Promise<any | null>;

function split(ref: string): { namespace: string; path: string } {
  const index = ref.indexOf(":");
  return index === -1
    ? { namespace: "minecraft", path: ref }
    : { namespace: ref.slice(0, index), path: ref.slice(index + 1) };
}

/**
 * Merge `path` and its parents: child textures win, the nearest element list wins,
 * and the walk stops at the first missing model or the depth limit.
 */
export async function loadFlatModel(
  path: string,
  version: string,
  fetchJson: JsonFetcher,
): Promise<FlatModel | null> {
  const textures: Record<string, string> = {};
  let elements: ModelElement[] | null = null;
  let current: string | null = path;
  let found = false;

  for (let depth = 0; depth < 6 && current; depth += 1) {
    // `builtin/generated` is a hardcoded renderer model, not a file on disk.
    if (current === "builtin/generated" || current.startsWith("builtin/")) break;

    const ref = split(current);
    const json = await fetchJson(
      `${ASSET_CDN}@${version}/assets/${ref.namespace}/models/${ref.path}.json`,
    );
    if (!json) break;
    found = true;

    for (const [key, value] of Object.entries(json.textures ?? {})) {
      if (typeof value === "string" && textures[key] === undefined) textures[key] = value;
    }
    if (elements === null && Array.isArray(json.elements)) {
      elements = json.elements as ModelElement[];
    }

    current = typeof json.parent === "string" ? json.parent : null;
  }

  if (!found) return null;
  return { textures, elements: elements ?? [] };
}

/** Follow `#variable` references until a real `namespace:path` texture is reached. */
export function resolveTextureRef(
  ref: string | undefined,
  textures: Record<string, string>,
  depth = 0,
): string | null {
  if (!ref || depth > 6) return null;

  if (ref.startsWith("#")) {
    const next = textures[ref.slice(1)];
    return next ? resolveTextureRef(next, textures, depth + 1) : null;
  }

  return ref.includes(":") ? ref : `minecraft:${ref}`;
}
