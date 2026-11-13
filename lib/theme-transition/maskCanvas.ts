import { drawBayerDissolveMask, type Point } from "./bayer";
import { drawHalftoneRevealMask } from "./halftoneReveal";
import type { ThemeTransitionMode } from "./preference";

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
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ctx = getCanvas(w, h);
  if (mode === "dither") {
    const cell = w <= 480 ? 5 : 6;
    drawBayerDissolveMask(ctx, w, h, progress, cell, origin);
  } else {
    const pitch = w <= 480 ? 10 : 12;
    drawHalftoneRevealMask(ctx, w, h, progress, pitch, origin);
  }
  return sharedCanvas!.toDataURL("image/png");
}
