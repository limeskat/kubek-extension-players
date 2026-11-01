// Isometric canvas renderer for Minecraft item/block models.
// Faces are projected orthographically and drawn as affine-mapped textures, which is
// why blocks, stairs and fences keep their 3D inventory look instead of a flat sprite.

import { ASSET_CDN, textureUrl } from "./item-textures";
import { resolveTextureRef, type FlatModel, type ModelElement } from "./model";

const ISO_X = Math.cos(Math.PI / 6);
const ISO_Y = Math.sin(Math.PI / 6);

/** Model space (0..16, y up) to screen space (x right, y down). */
export function projectPoint(x: number, y: number, z: number): [number, number] {
  return [(x - z) * ISO_X, (x + z) * ISO_Y - y];
}

/** Black overlay alpha per face, matching the vanilla inventory lighting. */
export function faceShade(face: string): number {
  switch (face) {
    case "up":
      return 0;
    case "north":
    case "south":
      return 0.14;
    case "east":
    case "west":
      return 0.28;
    case "down":
      return 0.45;
    default:
      return 0.2;
  }
}

const TINTS: Record<string, string> = {
  "block/grass_block_top": "#91bd59",
  "block/grass_block_side_overlay": "#91bd59",
  "block/tall_grass_top": "#7cbd4b",
  "block/fern": "#7cbd4b",
  "block/oak_leaves": "#59ae30",
  "block/jungle_leaves": "#30bb0b",
  "block/spruce_leaves": "#619961",
  "block/birch_leaves": "#80a755",
  "block/acacia_leaves": "#677534",
  "block/dark_oak_leaves": "#3f5b23",
};

function tintFor(ref: string): string | null {
  const path = ref.includes(":") ? ref.slice(ref.indexOf(":") + 1) : ref;
  return TINTS[path] ?? null;
}

type Point = [number, number];

type FaceQuad = {
  face: string;
  corners: Point[];
  depth: number;
  textureRef: string | null;
  uv: [number, number, number, number];
  tintindex: number;
  element: ModelElement;
};

function cornersFor(face: string, element: ModelElement): Array<[number, number, number]> {
  const [x0, y0, z0] = element.from;
  const [x1, y1, z1] = element.to;
  switch (face) {
    case "up":
      return [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    case "down":
      return [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]];
    case "north":
      return [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]];
    case "south":
      return [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]];
    case "east":
      return [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]];
    case "west":
      return [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]];
    default:
      return [];
  }
}

function rotatePoint(
  point: [number, number, number],
  rotation: NonNullable<ModelElement["rotation"]>,
): [number, number, number] {
  const [px, py, pz] = point;
  const [ox, oy, oz] = rotation.origin;
  const angle = (rotation.angle * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = px - ox;
  const y = py - oy;
  const z = pz - oz;

  if (rotation.axis === "x") return [x + ox, y * cos - z * sin + oy, y * sin + z * cos + oz];
  if (rotation.axis === "y") return [x * cos + z * sin + ox, y + oy, -x * sin + z * cos + oz];
  return [x * cos - y * sin + ox, x * sin + y * cos + oy, z + oz];
}

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(url: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const pending = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
  imageCache.set(url, pending);
  return pending;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export function renderShield(version: string, size = 64): Promise<string | null> {
  // Wood face for the shield silhouette; the entity texture is only a blank mask.
  return loadImage(`${ASSET_CDN}@${version}/assets/minecraft/textures/block/oak_planks.png`).then(
    (image) => {
      if (!image) return null;
      const canvas = makeCanvas(size);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const s = size / 32;
      ctx.beginPath();
      ctx.moveTo(16 * s, 2 * s);
      ctx.lineTo(29 * s, 6 * s);
      ctx.lineTo(29 * s, 16 * s);
      ctx.quadraticCurveTo(29 * s, 27 * s, 16 * s, 31 * s);
      ctx.quadraticCurveTo(3 * s, 27 * s, 3 * s, 16 * s);
      ctx.lineTo(3 * s, 6 * s);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0, size, size);
      ctx.restore();

      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = Math.max(2, s * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = Math.max(1, s);
      ctx.stroke();

      return canvas.toDataURL("image/png");
    },
  );
}

/** Render a model with elements to a transparent PNG data url. */
export async function renderModel(model: FlatModel, version: string, size = 64): Promise<string | null> {
  if (typeof document === "undefined") return null;
  if (!model.elements.length) return null;

  const quads: FaceQuad[] = [];
  for (const element of model.elements) {
    for (const [face, definition] of Object.entries(element.faces ?? {})) {
      const raw = cornersFor(face, element);
      if (raw.length !== 4) continue;

      const corners3d = element.rotation
        ? raw.map((corner) => rotatePoint(corner, element.rotation!))
        : raw;

      const projected = corners3d.map(([x, y, z]) => projectPoint(x, y, z));
      const depth =
        corners3d.reduce((sum, [x, y, z]) => sum + (x + z + y * 0.5), 0) / corners3d.length;

      quads.push({
        face,
        corners: projected,
        depth,
        textureRef: resolveTextureRef(definition.texture, model.textures),
        uv: definition.uv ?? [0, 0, 16, 16],
        tintindex: definition.tintindex ?? -1,
        element,
      });
    }
  }
  if (!quads.length) return null;

  // Fit every projected corner into the canvas.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const quad of quads) {
    for (const [x, y] of quad.corners) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const padding = size * 0.08;
  const scale = Math.min(
    (size - padding * 2) / Math.max(maxX - minX, 0.001),
    (size - padding * 2) / Math.max(maxY - minY, 0.001),
  );
  const offsetX = size / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = size / 2 - ((minY + maxY) / 2) * scale;

  const canvas = makeCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;

  // Painter's algorithm: farthest faces first.
  quads.sort((a, b) => a.depth - b.depth);

  for (const quad of quads) {
    if (!quad.textureRef) continue;

    const url = textureUrl(quad.textureRef, version);
    if (!url) continue;
    const image = await loadImage(url);
    if (!image) continue;

    const points = quad.corners.map(
      ([x, y]): Point => [x * scale + offsetX, y * scale + offsetY],
    );
    const [tl, tr, , bl] = points;
    const ux = tr[0] - tl[0];
    const uy = tr[1] - tl[1];
    const vx = bl[0] - tl[0];
    const vy = bl[1] - tl[1];

    const [u1, v1, u2, v2] = quad.uv;
    const sx = (u1 / 16) * image.width;
    const sy = (v1 / 16) * image.height;
    const sw = ((u2 - u1) / 16) * image.width;
    const sh = ((v2 - v1) / 16) * image.height;
    if (sw <= 0 || sh <= 0) continue;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.clip();

    ctx.setTransform(ux, uy, vx, vy, tl[0], tl[1]);
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 1, 1);

    const shade = faceShade(quad.face);
    if (shade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${shade})`;
      ctx.fillRect(0, 0, 1, 1);
    }

    const tint = tintFor(quad.textureRef);
    if (tint) {
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, 1, 1);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
