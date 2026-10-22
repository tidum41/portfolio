/** 8×8 Bayer matrix, values 0–63 (PS3-XMB ordered dither ordering). */
const BAYER_8: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export type Point = { x: number; y: number };

export function bayerThreshold(tx: number, ty: number): number {
  return BAYER_8[ty & 7][tx & 7] / 64;
}

/**
 * Crisp tile mask: white = new theme visible. `progress` 0→1 eases in Bayer order,
 * optionally biased toward `origin` (viewport px).
 */
export function drawBayerDissolveMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  cellSize: number,
  origin?: Point,
): void {
  ctx.clearRect(0, 0, width, height);
  const tilesX = Math.ceil(width / cellSize);
  const tilesY = Math.ceil(height / cellSize);
  const maxDist = Math.hypot(width, height);

  ctx.fillStyle = "#fff";
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      let threshold = bayerThreshold(tx, ty);
      if (origin && maxDist > 0) {
        const cx = (tx + 0.5) * cellSize;
        const cy = (ty + 0.5) * cellSize;
        const dist = Math.hypot(cx - origin.x, cy - origin.y) / maxDist;
        threshold = threshold * 0.62 + dist * 0.38;
      }
      if (threshold < progress) {
        ctx.fillRect(tx * cellSize, ty * cellSize, cellSize, cellSize);
      }
    }
  }
}
