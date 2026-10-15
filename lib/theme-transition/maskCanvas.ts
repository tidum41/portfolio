import { drawHalftoneRevealMask } from "./halftoneReveal";
import { ditherMaskDataUrl } from "./ditherCanvasMask";
import type { ThemeTransitionMode } from "./preference";
import type { Point } from "./bayer";

let sharedCanvas: HTMLCanvasElement | null = null;

function getCanvas(w: number, h: number): CanvasRenderingContext2D {
  if (!sharedCanvas) sharedCanvas = document.createElement("canvas");
  if (sharedCanvas.width !== w || sharedCanvas.height !== h) {
    sharedCanvas.width = w;
    sharedCanvas.height = h;
  }
  const ctx = sharedCanvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function maskDataUrlForProgress(
  mode: Exclude<ThemeTransitionMode, "default">,
  progress: number,
  origin: Point,
): string {
  if (mode === "dither") {
    return ditherMaskDataUrl(progress, origin);
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const pitch = w <= 480 ? 10 : 12;
  const scale = 4;
  const lw = Math.ceil(w / scale);
  const lh = Math.ceil(h / scale);
  const ctx = getCanvas(lw, lh);
  drawHalftoneRevealMask(
    ctx,
    lw,
    lh,
    progress,
    Math.max(2, pitch / scale),
    { x: origin.x / scale, y: origin.y / scale },
  );
  return sharedCanvas!.toDataURL("image/png");
}
