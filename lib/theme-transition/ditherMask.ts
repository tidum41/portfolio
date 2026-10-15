import { bayerThreshold } from "./bayer";

/** Fine grain. 8×8 matrix × 2px = one 16px tile, repeated by the mask. */
export const DITHER_CELL_PX = 2;
export const DITHER_DURATION_MS = 440;

const FRAME_COUNT = 32;
const TILE = 8;

let cachedFrames: string | null = null;
let cachedUrls: string[] | null = null;
let warmPromise: Promise<void> | null = null;
/** Pinned so the decoded tiles are not collected before the first click. */
const keptTiles: HTMLImageElement[] = [];
let cancelWarmSnapshot: (() => void) | null = null;

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
 * Keyframe body for `theme-dither-reveal`. One 16×16 Bayer tile per step,
 * white = new theme visible. Built once; the transition only plays it.
 */
export function ditherRevealKeyframes(): string {
  if (cachedFrames) return cachedFrames;
  if (typeof document === "undefined") return "0%{mask-image:none}100%{mask-image:none}";

  const urls = tileUrls();
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

function tileUrls(): string[] {
  if (!cachedUrls) cachedUrls = buildTileUrls();
  return cachedUrls;
}

/**
 * Decode every mask step and paint them once offscreen, then capture the
 * other theme into a hidden snapshot. The first real click then only
 * starts the animation.
 */
export function warmDitherAssets(): Promise<void> {
  if (warmPromise) return warmPromise;
  if (typeof document === "undefined") return Promise.resolve();
  ditherRevealKeyframes();
  warmPromise = warm().then(() => undefined, () => {
    warmPromise = null;
  });
  return warmPromise;
}

/** End a hidden warm capture so a real click can start its own transition. */
export function abortDitherWarm(): void {
  cancelWarmSnapshot?.();
}

async function warm(): Promise<void> {
  const urls = tileUrls();
  await Promise.all(urls.map((url) => decodeTile(url)));
  await paintMasksOffscreen(urls);
  await playMaskOffscreen();
  await warmSnapshot();
}

/** Each step as its own mask, so the CSS mask decoder sees every tile. */
async function paintMasksOffscreen(urls: string[]): Promise<void> {
  const tile = DITHER_CELL_PX * TILE;
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-200px;top:0;pointer-events:none";
  for (const url of urls) {
    const el = document.createElement("div");
    el.style.cssText = `width:${tile}px;height:${tile}px;mask-image:url("${url}");mask-size:${tile}px ${tile}px;mask-repeat:repeat;mask-mode:luminance;-webkit-mask-image:url("${url}");-webkit-mask-size:${tile}px ${tile}px;-webkit-mask-repeat:repeat`;
    host.appendChild(el);
  }
  document.body.appendChild(host);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  // Stay in the document. Removing the masks lets the CSS image cache drop
  // them, and the first click decodes every step again.
}

/** Play the same mask animation offscreen so each step is decoded before a click. */
async function playMaskOffscreen(): Promise<void> {
  const tile = DITHER_CELL_PX * TILE;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "position:fixed",
    "left:-200px",
    "top:0",
    `width:${tile}px`,
    `height:${tile}px`,
    "pointer-events:none",
    "animation:theme-dither-reveal 440ms linear both",
    `mask-size:${tile}px ${tile}px`,
    "mask-repeat:repeat",
    "mask-mode:luminance",
    `-webkit-mask-size:${tile}px ${tile}px`,
    "-webkit-mask-repeat:repeat",
  ].join(";");
  document.body.appendChild(el);
  const anim = el.getAnimations().find((item) => "animationName" in item && item.animationName === "theme-dither-reveal");
  if (anim) {
    anim.playbackRate = 8;
    await anim.finished.catch(() => undefined);
  }
  el.remove();
}

/**
 * Capture the destination theme once while the old snapshot still covers
 * the page. Restoring the theme inside the update callback made the new
 * snapshot a copy of the old one, so the first click still styled the
 * whole tree.
 */
async function warmSnapshot(): Promise<void> {
  const html = document.documentElement;
  const start = document.startViewTransition?.bind(document);
  if (!start || html.hasAttribute("data-theme-transition") || cancelWarmSnapshot) return;

  const prev = html.getAttribute("data-theme");
  const next = prev === "light" ? "dark" : "light";
  let vt: ViewTransition | null = null;
  let restored = false;

  const finish = () => {
    if (restored) return;
    restored = true;
    cancelWarmSnapshot = null;
    if (html.getAttribute("data-theme") !== prev) {
      if (prev) html.setAttribute("data-theme", prev);
      else html.removeAttribute("data-theme");
    }
    html.classList.remove("theme-switching");
    delete html.dataset.ditherWarmVt;
    if (!vt) return;
    try {
      vt.skipTransition();
    } catch {
      /* already finished */
    }
  };

  cancelWarmSnapshot = finish;
  html.dataset.ditherWarmVt = "1";

  try {
    vt = start(() => {
      html.classList.add("theme-switching");
      html.setAttribute("data-theme", next);
      void document.body.offsetWidth;
    });
    await vt.ready;
  } catch {
    /* unsupported, aborted, or a real transition took over */
  } finally {
    finish();
  }
}

function decodeTile(url: string): Promise<void> {
  const img = new Image();
  img.decoding = "sync";
  img.src = url;
  keptTiles.push(img);
  return img.decode().then(() => undefined, () => undefined);
}
