import { buildDitherThresholdMap, ditherCellSize } from "./ditherThresholdMap";
import type { Point } from "./bayer";

let canvas: HTMLCanvasElement | null = null;
let cachedKey = "";
let cachedMap: Uint8Array | null = null;
let cachedTilesX = 0;
let cachedTilesY = 0;
let cachedImage: ImageData | null = null;

function ensureCanvas(tilesX: number, tilesY: number): CanvasRenderingContext2D {
  if (!canvas) canvas = document.createElement("canvas");
  if (canvas.width !== tilesX || canvas.height !== tilesY) {
    canvas.width = tilesX;
    canvas.height = tilesY;
    cachedImage = null;
  }
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

function loadThresholds(width: number, height: number, cell: number, origin: Point): void {
  const key = `${width}|${height}|${cell}|${origin.x}|${origin.y}`;
  if (key === cachedKey && cachedMap) return;
  const built = buildDitherThresholdMap(width, height, cell, origin);
  cachedMap = built.map;
  cachedTilesX = built.tilesX;
  cachedTilesY = built.tilesY;
  cachedKey = key;
  cachedImage = null;
}

/** Low-res Bayer mask; one PNG encode per progress step. */
export function ditherMaskDataUrl(progress: number, origin: Point): string {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cell = ditherCellSize(w);
  loadThresholds(w, h, cell, origin);

  const tilesX = cachedTilesX;
  const tilesY = cachedTilesY;
  const map = cachedMap!;
  const ctx = ensureCanvas(tilesX, tilesY);

  if (!cachedImage || cachedImage.width !== tilesX || cachedImage.height !== tilesY) {
    cachedImage = ctx.createImageData(tilesX, tilesY);
  }
  const data = cachedImage.data;
  const cutoff = Math.min(255, Math.floor(progress * 256));
  for (let i = 0; i < map.length; i++) {
    const on = map[i] < cutoff;
    const o = i * 4;
    const v = on ? 255 : 0;
    data[o] = v;
    data[o + 1] = v;
    data[o + 2] = v;
    data[o + 3] = 255;
  }
  ctx.putImageData(cachedImage, 0, 0);
  return canvas!.toDataURL("image/png");
}
