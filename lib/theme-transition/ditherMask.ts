import { bayerThreshold } from "./bayer";

/** Fine grain. 8×8 matrix × 3px = one 24px tile, repeated by the mask. */
export const DITHER_CELL_PX = 3;
export const DITHER_DURATION_MS = 560;

const FRAME_COUNT = 32;
const TILE = 8;

let cachedFrames: string | null = null;

/** Ease-in-out cubic, inverted so keyframe offsets follow the curve.
 *  The animation timing function eases each keyframe interval, not the
 *  whole timeline, so the gentleness has to live in the offsets. */
function inverseEaseInOut(y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const eased = mid < 0.5 ? 4 * mid * mid * mid : 1 - (-2 * mid + 2) ** 3 / 2;
    if (eased < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function buildTileUrls(): string[] {
  const size = DITHER_CELL_PX * TILE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("2d context unavailable");
  const image = ctx.createImageData(size, size);
  const data = image.data;
  const urls: string[] = [];

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const cutoff = (frame / (FRAME_COUNT - 1)) * 64;
    for (let ty = 0; ty < TILE; ty++) {
      for (let tx = 0; tx < TILE; tx++) {
        const on = Math.round(bayerThreshold(tx, ty) * 64) < cutoff;
        const v = on ? 255 : 0;
        for (let py = 0; py < DITHER_CELL_PX; py++) {
          for (let px = 0; px < DITHER_CELL_PX; px++) {
            const o = ((ty * DITHER_CELL_PX + py) * size + (tx * DITHER_CELL_PX + px)) * 4;
            data[o] = v;
            data[o + 1] = v;
            data[o + 2] = v;
            data[o + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(image, 0, 0);
    urls.push(canvas.toDataURL("image/png"));
  }

  return urls;
}

/**
 * Keyframe body for `theme-dither-reveal`. One 24×24 Bayer tile per step,
 * white = new theme visible. Built once; the transition only plays it.
 */
export function ditherRevealKeyframes(): string {
  if (cachedFrames) return cachedFrames;
  if (typeof document === "undefined") return "0%{mask-image:none}100%{mask-image:none}";

  const urls = buildTileUrls();
  const last = urls.length - 1;
  const parts: string[] = [];
  let prev = -1;
  for (let i = 0; i <= last; i++) {
    let pct = inverseEaseInOut(i / last) * 100;
    if (pct <= prev) pct = Math.min(100, prev + 0.0001);
    prev = pct;
    const url = urls[i];
    parts.push(`${pct.toFixed(4)}%{mask-image:url("${url}");-webkit-mask-image:url("${url}")}`);
  }
  cachedFrames = parts.join("");
  return cachedFrames;
}
