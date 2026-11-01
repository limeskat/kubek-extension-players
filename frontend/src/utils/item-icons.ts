// Chooses how an item icon is produced: the hosted vanilla renderer when available,
// then a rendered 3D model, the shield silhouette, or a flat texture.
// Results are cached per version and item id.

import {
  FALLBACK_VERSION,
  fetchJsonAsset,
  resolveItemModelPath,
  resolveItemTexture,
  type JsonFetcher,
} from "./item-textures";
import { loadFlatModel } from "./model";
import { renderModel, renderShield } from "./model-renderer";

export const REMOTE_API = "https://api.minecraftitems.xyz/api/item";
/** Flip to false to stay fully self-hosted (local renderer only). */
const USE_REMOTE_ICONS = true;

const iconCache = new Map<string, string | null>();

/** Vanilla ids map to the hosted renderer; modded namespaces never do. */
export function apiItemUrl(id: string): string | null {
  if (!id.startsWith("minecraft:")) return null;
  const name = id.slice("minecraft:".length);
  if (!/^[a-z0-9_]+$/.test(name)) return null;
  return `${REMOTE_API}/${name}`;
}

/** Numeric segment comparison, so "26.2" counts as newer than "1.21.4". */
export function versionAtLeast(version: string, minimum: string): boolean {
  const parse = (value: string) =>
    value
      .replace(/^v/i, "")
      .split(/[.\-+]/)
      .map((part) => Number.parseInt(part, 10))
      .filter((part) => !Number.isNaN(part));

  const left = parse(version);
  const right = parse(minimum);
  if (!left.length) return false;

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;
    if (a !== b) return a > b;
  }
  return true;
}

function preloads(url: string): Promise<boolean> {
  if (typeof Image === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

export async function resolveItemIcon(
  id: string,
  version: string,
  options: { fetchJson?: JsonFetcher; cache?: Map<string, string | null> } = {},
): Promise<string | null> {
  const cleanVersion = (version || FALLBACK_VERSION).trim() || FALLBACK_VERSION;
  const cache = options.cache ?? iconCache;
  const key = `${cleanVersion}:${id}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  // The hosted renderer matches the vanilla GUI, but it only serves current vanilla items.
  const remote = apiItemUrl(id);
  if (USE_REMOTE_ICONS && remote && versionAtLeast(cleanVersion, "1.21.4") && (await preloads(remote))) {
    cache.set(key, remote);
    return remote;
  }

  const fetchJson = options.fetchJson ?? fetchJsonAsset;

  if (id === "minecraft:shield") {
    const shield = await renderShield(cleanVersion);
    if (shield) {
      cache.set(key, shield);
      return shield;
    }
  }

  const modelPath = await resolveItemModelPath(id, cleanVersion, fetchJson);
  if (modelPath) {
    const model = await loadFlatModel(modelPath, cleanVersion, fetchJson);
    if (model && model.elements.length > 0) {
      const rendered = await renderModel(model, cleanVersion);
      if (rendered) {
        cache.set(key, rendered);
        return rendered;
      }
    }
  }

  const flat = await resolveItemTexture(id, cleanVersion, { fetchJson });
  cache.set(key, flat);
  return flat;
}
