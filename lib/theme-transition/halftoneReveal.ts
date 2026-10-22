import type { Point } from "./bayer";

/**
 * Halftone dot reveal: each grid cell grows a circle from the toggle origin
 * until dots merge and cover the viewport (white = new theme visible).
 */
export function drawHalftoneRevealMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  pitch: number,
  origin: Point,
): void {
  ctx.clearRect(0, 0, width, height);
  const cols = Math.ceil(width / pitch);
  const rows = Math.ceil(height / pitch);
  const maxDist = Math.hypot(width, height);
  const maxRadius = pitch * 0.58;

  ctx.fillStyle = "#fff";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * pitch + pitch / 2;
      const cy = row * pitch + pitch / 2;
      const dist = Math.hypot(cx - origin.x, cy - origin.y) / maxDist;
      const local = Math.min(1, Math.max(0, progress * 1.15 - dist * 0.55));
      if (local <= 0) continue;
      const r = maxRadius * local;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
