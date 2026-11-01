// Item icons come from the Minecraft asset mirror used by mcasset.cloud.
// Resolution goes through the item definition and its model chain, because guessing
// item/ vs block/ paths misses items such as oak_sapling (model under item/, texture
// under block/) and anything renamed by a newer game version.

export const ASSET_CDN = "https://cdn.jsdelivr.net/gh/InventivetalentDev/minecraft-assets";
export const FALLBACK_VERSION = "1.21.9";

export type JsonFetcher = (url: string) => Promise<any | null>;

type ResolveOptions = {
  fetchJson?: JsonFetcher;
  /** Keyed `${version}:${itemId}`; shared by default so one dialog open warms the next. */
  cache?: Map<string, string | null>;
};

const memoryCache = new Map<string, string | null>();

function splitRef(ref: string): { namespace: string; path: string } | null {
  const index = ref.indexOf(":");
  const namespace = index === -1 ? "minecraft" : ref.slice(0, index);
  const path = index === -1 ? ref : ref.slice(index + 1);
  if (!namespace || !path) return null;
  return { namespace, path };
}

/** `minecraft:item/arrow` -> `https://…@26.2/assets/minecraft/textures/item/arrow.png` */
export function textureUrl(ref: string, version: string): string | null {
  const parts = splitRef(ref);
  if (!parts) return null;
  return `${ASSET_CDN}@${version}/assets/${parts.namespace}/textures/${parts.path}.png`;
}

/** Pick the texture a flat item renders with. */
export function pickTexture(textures?: Record<string, string>): string | null {
  if (!textures) return null;
  for (const key of ["layer0", "all", "side"]) {
    const value = textures[key];
    if (typeof value === "string" && value) return value;
  }
  return (
    Object.entries(textures).find(
      ([key, value]) => key !== "particle" && typeof value === "string" && value,
    )?.[1] ?? null
  );
}

/** Pull a model name out of any item model node (model, select, range_dispatch, …). */
export function firstModelName(node: any, depth = 0): string | null {
  if (!node || depth > 5) return null;
  if (typeof node === "string") return node;
  if (typeof node.model === "string") return node.model;
  if (node.model) {
    const nested = firstModelName(node.model, depth + 1);
    if (nested) return nested;
  }
  if (node.fallback) {
    const fromFallback = firstModelName(node.fallback, depth + 1);
    if (fromFallback) return fromFallback;
  }
  if (Array.isArray(node.cases)) {
    for (const entry of node.cases) {
      const fromCase = firstModelName(entry?.model, depth + 1);
      if (fromCase) return fromCase;
    }
  }
  if (Array.isArray(node.models)) {
    for (const entry of node.models) {
      const fromModel = firstModelName(entry, depth + 1);
      if (fromModel) return fromModel;
    }
  }
  return null;
}

async function fetchJsonDefault(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Resolve the texture URL for an item id on a specific game version.
 * Returns null for modded namespaces and unknown items; those get a generic glyph.
 */
export async function resolveItemTexture(
  id: string,
  version: string,
  options: ResolveOptions = {},
): Promise<string | null> {
  const cleanVersion = (version || FALLBACK_VERSION).trim() || FALLBACK_VERSION;
  const cache = options.cache ?? memoryCache;
  const key = `${cleanVersion}:${id}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const parts = splitRef(id);
  if (!parts || parts.namespace !== "minecraft") {
    cache.set(key, null);
    return null;
  }

  const fetchJson = options.fetchJson ?? fetchJsonDefault;
  const assets = `${ASSET_CDN}@${cleanVersion}/assets/minecraft`;

  // 1.21.4+ declares items in items/<id>.json; older versions only have the model.
  let model: string | null = null;
  const definition = await fetchJson(`${assets}/items/${parts.path}.json`);
  if (definition) model = firstModelName(definition.model);

  // Items without an item definition (older versions) or with a model type we cannot
  // read (special models) still usually have a plain models/item file.
  if (!model) {
    const legacy = await fetchJson(`${assets}/models/item/${parts.path}.json`);
    if (legacy) model = `minecraft:item/${parts.path}`;
  }

  if (!model) {
    cache.set(key, null);
    return null;
  }

  // Follow the parent chain until a model names a texture.
  let current: string | null = model;
  let sawModelFile = false;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const ref = splitRef(current);
    if (!ref) break;

    const modelJson = await fetchJson(
      `${ASSET_CDN}@${cleanVersion}/assets/${ref.namespace}/models/${ref.path}.json`,
    );
    if (!modelJson) break;
    sawModelFile = true;

    const texture = pickTexture(modelJson.textures);
    if (texture) {
      const url = textureUrl(texture, cleanVersion);
      cache.set(key, url);
      return url;
    }

    current = typeof modelJson.parent === "string" ? modelJson.parent : null;
  }

  // A model with only a particle texture (special models) has no flat icon.
  if (sawModelFile) {
    cache.set(key, null);
    return null;
  }

  // No model file at all: the model path itself is usually the texture path.
  const fallback = textureUrl(model, cleanVersion);
  cache.set(key, fallback);
  return fallback;
}
