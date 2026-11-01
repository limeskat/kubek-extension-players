// Chooses how an item icon is produced: a rendered 3D model, the shield silhouette,
// or a flat texture. Results are cached per version and item id.

import {
  FALLBACK_VERSION,
  fetchJsonAsset,
  resolveItemModelPath,
  resolveItemTexture,
  type JsonFetcher,
} from "./item-textures";
import { loadFlatModel } from "./model";
import { renderModel, renderShield } from "./model-renderer";

const iconCache = new Map<string, string | null>();

export async function resolveItemIcon(
  id: string,
  version: string,
  options: { fetchJson?: JsonFetcher; cache?: Map<string, string | null> } = {},
): Promise<string | null> {
  const cleanVersion = (version || FALLBACK_VERSION).trim() || FALLBACK_VERSION;
  const cache = options.cache ?? iconCache;
  const key = `${cleanVersion}:${id}`;
  if (cache.has(key)) return cache.get(key) ?? null;

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
