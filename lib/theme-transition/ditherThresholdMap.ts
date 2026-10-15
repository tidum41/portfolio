import { bayerThreshold, type Point } from "./bayer";

export function ditherCellSize(viewportWidth: number): number {
  return viewportWidth <= 480 ? 5 : 6;
}

/** Combined Bayer + radial bias, 0–255 for fast integer compare against `progress * 256`. */
export function buildDitherThresholdMap(
  width: number,
  height: number,
  cellSize: number,
  origin?: Point,
): { map: Uint8Array; tilesX: number; tilesY: number } {
  const tilesX = Math.ceil(width / cellSize);
  const tilesY = Math.ceil(height / cellSize);
  const map = new Uint8Array(tilesX * tilesY);
  const maxDist = Math.hypot(width, height);

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      let threshold = bayerThreshold(tx, ty);
      if (origin && maxDist > 0) {
        const cx = (tx + 0.5) * cellSize;
        const cy = (ty + 0.5) * cellSize;
        const dist = Math.hypot(cx - origin.x, cy - origin.y) / maxDist;
        threshold = threshold * 0.62 + dist * 0.38;
      }
      map[ty * tilesX + tx] = Math.min(255, Math.floor(threshold * 256));
    }
  }

  return { map, tilesX, tilesY };
}

/** Grayscale PNG source for SVG feImage (alpha carries threshold). */
export function thresholdMapToPngDataUrl(
  map: Uint8Array,
  tilesX: number,
  tilesY: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = tilesX;
  canvas.height = tilesY;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("2d context unavailable");
  const img = ctx.createImageData(tilesX, tilesY);
  for (let i = 0; i < map.length; i++) {
    const v = map[i];
    const o = i * 4;
    img.data[o] = v;
    img.data[o + 1] = v;
    img.data[o + 2] = v;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}
