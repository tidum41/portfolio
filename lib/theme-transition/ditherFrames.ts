import type { Point } from "./bayer";
import { buildDitherThresholdMap, ditherCellSize } from "./ditherThresholdMap";

/** Discrete mask steps. The clock is the reveal itself; snapshot setup sits outside it. */
export const DITHER_FRAME_COUNT = 20;
export const DITHER_DURATION_MS = 210;

export type DitherFrames = {
  key: string;
  urls: string[];
  map: Uint8Array;
  tilesX: number;
  tilesY: number;
};

let cached: DitherFrames | null = null;
const decoded = new Set<string>();

function cacheKey(origin: Point): string {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cell = ditherCellSize(w);
  return `${w}x${h}x${cell}@${Math.round(origin.x)}x${Math.round(origin.y)}`;
}

function cutoffForFrame(frame: number, frames: number): number {
  if (frame <= 0) return 0;
  if (frame >= frames - 1) return 256;
  return Math.round((frame / (frames - 1)) * 256);
}

/** 0 = old theme, last index = new theme fully revealed. */
export function ditherFrameIndex(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  return Math.round(p * (DITHER_FRAME_COUNT - 1));
}

export function ditherCutoffForProgress(progress: number): number {
  return cutoffForFrame(ditherFrameIndex(progress), DITHER_FRAME_COUNT);
}

function buildFrames(origin: Point, key: string): DitherFrames {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cell = ditherCellSize(w);
  const { map, tilesX, tilesY } = buildDitherThresholdMap(w, h, cell, origin);

  const canvas = document.createElement("canvas");
  canvas.width = tilesX;
  canvas.height = tilesY;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingEnabled = false;
  const image = ctx.createImageData(tilesX, tilesY);
  const data = image.data;
  const urls: string[] = [];

  for (let frame = 0; frame < DITHER_FRAME_COUNT; frame++) {
    const cutoff = cutoffForFrame(frame, DITHER_FRAME_COUNT);
    for (let i = 0; i < map.length; i++) {
      const on = map[i] < cutoff;
      const o = i * 4;
      const v = on ? 255 : 0;
      data[o] = v;
      data[o + 1] = v;
      data[o + 2] = v;
      data[o + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    const url = canvas.toDataURL("image/png");
    urls.push(url);
    if (!decoded.has(url)) {
      decoded.add(url);
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    }
  }

  return { key, urls, map, tilesX, tilesY };
}

/** Encode + decode ahead of the click so the transition only swaps a cached URL. */
export function warmDitherFrames(origin: Point): DitherFrames {
  const key = cacheKey(origin);
  if (cached?.key === key) return cached;
  cached = buildFrames(origin, key);
  return cached;
}

export function peekDitherFrames(origin: Point): DitherFrames | null {
  const key = cacheKey(origin);
  return cached?.key === key ? cached : null;
}
