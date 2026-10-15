import {
  applyThemeInstant,
  commitTheme,
  type SiteTheme,
} from "./applyTheme";
import type { Point } from "./bayer";
import {
  DITHER_DURATION_MS,
  ditherCutoffForProgress,
  ditherFrameIndex,
  warmDitherFrames,
  type DitherFrames,
} from "./ditherFrames";
import { maskDataUrlForProgress } from "./maskCanvas";
import type { ThemeTransitionMode } from "./preference";

const VT_STYLE_ID = "theme-transition-vt-style";
const OVERLAY_ID = "theme-transition-overlay";
const HALFTONE_MS = 500;
/** Seek the first presented frame into the curve so the click's own paint
 *  already shows dither, instead of a fully hidden mask that looks unchanged. */
const START_LEAD_MS = 16;

type MaskMode = Exclude<ThemeTransitionMode, "default">;

type Flight = {
  mode: MaskMode;
  origin: Point;
  fullMs: number;
  from: number;
  to: 0 | 1;
  t0: number;
  dur: number;
  themeAt0: SiteTheme;
  themeAt1: SiteTheme;
  frames: DitherFrames | null;
  vt: ViewTransition;
  raf: number;
  timer: number;
  lastFrame: number;
  pending: Array<() => void>;
  overlay: OverlayBuf | null;
  /** False until the snapshot is on screen. Clicks before that cancel or retarget without advancing the clock. */
  visible: boolean;
};

type OverlayBuf = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  image: ImageData;
  tilesX: number;
  tilesY: number;
};

let flight: Flight | null = null;
let toggleForwarder = false;

const SAFARI_MASK = typeof navigator !== "undefined" &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|chromium|android/i.test(navigator.userAgent);

/**
 * The root snapshot is the thing under the cursor, so a click on the toggle
 * is delivered to <html>. Replay it on the button. Untrusted clicks are the
 * replay itself and must not loop.
 */
function installToggleForwarder(): void {
  if (toggleForwarder || typeof document === "undefined") return;
  toggleForwarder = true;
  document.addEventListener(
    "click",
    (event) => {
      if (!flight || !event.isTrusted) return;
      const { clientX: x, clientY: y } = event;
      const buttons = document.querySelectorAll("[data-theme-toggle]");
      for (const button of buttons) {
        if (!(button instanceof HTMLButtonElement)) continue;
        if (event.target instanceof Node && button.contains(event.target)) return;
        const rect = button.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
        event.preventDefault();
        event.stopPropagation();
        button.click();
        return;
      }
    },
    true,
  );
}

function applyDitherMask(url: string): void {
  const value = `url("${url}")`;
  document.documentElement.style.setProperty("--theme-dither-mask", value);
  if (!SAFARI_MASK) return;
  const el = document.getElementById(VT_STYLE_ID);
  if (!el?.textContent) return;
  el.textContent = el.textContent
    .replace(/-webkit-mask-image:\s*[^;]+;/g, `-webkit-mask-image: ${value};`)
    .replace(/(?<!-webkit-)mask-image:\s*[^;]+;/g, `mask-image: ${value};`);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function readTheme(): SiteTheme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function ensureVtStyleSheet(): HTMLStyleElement {
  let el = document.getElementById(VT_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = VT_STYLE_ID;
    document.head.appendChild(el);
  }
  return el;
}

function holdCss(): string {
  return `
    @keyframes theme-vt-hold {
      from { opacity: 1; }
      to { opacity: 1; }
    }
    /* The root snapshot replaces the document for hit testing. Every pseudo
       in that tree has to ignore pointers or a click on the toggle lands on
       <html> and the in-flight dissolve cannot reverse. */
    ::view-transition,
    ::view-transition-group(root),
    ::view-transition-image-pair(root),
    ::view-transition-old(root),
    ::view-transition-new(root) {
      pointer-events: none;
    }
    ::view-transition-group(root) {
      animation: theme-vt-hold 60s linear infinite;
    }
    ::view-transition-old(root) {
      animation: theme-vt-hold 60s linear infinite;
      mix-blend-mode: normal;
      opacity: 1;
      z-index: 1;
    }
  `;
}

function installDitherSheet(): void {
  const crisp = `
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  `;
  ensureVtStyleSheet().textContent = `
    ${holdCss()}
    ::view-transition-new(root) {
      animation: theme-vt-hold 60s linear infinite;
      mix-blend-mode: normal;
      opacity: 1;
      z-index: 2;
      mask-image: var(--theme-dither-mask);
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      mask-mode: luminance;
      -webkit-mask-image: var(--theme-dither-mask);
      -webkit-mask-size: 100% 100%;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-source-type: luminance;
      ${crisp}
    }
  `;
}

function installHalftoneSheet(url: string): void {
  ensureVtStyleSheet().textContent = `
    ${holdCss()}
    ::view-transition-new(root) {
      animation: theme-vt-hold 60s linear infinite;
      mix-blend-mode: normal;
      opacity: 1;
      z-index: 2;
      mask-image: url("${url}");
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      mask-mode: luminance;
      -webkit-mask-image: url("${url}");
      -webkit-mask-size: 100% 100%;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-source-type: luminance;
    }
  `;
}

function clearVtStyles(): void {
  const el = document.getElementById(VT_STYLE_ID);
  if (el) el.textContent = "";
  const html = document.documentElement;
  html.removeAttribute("data-theme-transition");
  html.style.removeProperty("--theme-dither-mask");
  html.style.removeProperty("--theme-transition-duration");
}

function ensureOverlay(frames: DitherFrames): OverlayBuf {
  let canvas = document.getElementById(OVERLAY_ID) as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = OVERLAY_ID;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1";
    document.body.appendChild(canvas);
  }
  if (canvas.width !== frames.tilesX || canvas.height !== frames.tilesY) {
    canvas.width = frames.tilesX;
    canvas.height = frames.tilesY;
  }
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.imageSmoothingEnabled = false;
  return {
    canvas,
    ctx,
    image: ctx.createImageData(frames.tilesX, frames.tilesY),
    tilesX: frames.tilesX,
    tilesY: frames.tilesY,
  };
}

/** Transparent pixels are the revealed new theme — the bench reads this back. */
function paintOverlay(buf: OverlayBuf, map: Uint8Array, cutoff: number): void {
  const data = buf.image.data;
  for (let i = 0; i < map.length; i++) {
    const revealed = map[i] < cutoff;
    const o = i * 4;
    const cover = revealed ? 0 : 255;
    data[o] = cover;
    data[o + 1] = cover;
    data[o + 2] = cover;
    data[o + 3] = cover;
  }
  buf.ctx.putImageData(buf.image, 0, 0);
}

function sample(f: Flight, now: number): number {
  const u = f.dur <= 0 ? 1 : Math.min(1, (now - f.t0) / f.dur);
  if (u >= 1) return f.to;
  const eased = easeOutCubic(u);
  return f.from + (f.to - f.from) * eased;
}

function paint(f: Flight, progress: number): void {
  if (f.mode === "dither" && f.frames) {
    const frame = ditherFrameIndex(progress);
    if (frame === f.lastFrame) return;
    f.lastFrame = frame;
    const url = f.frames.urls[frame] ?? f.frames.urls[f.frames.urls.length - 1];
    applyDitherMask(url);
    if (f.overlay) paintOverlay(f.overlay, f.frames.map, ditherCutoffForProgress(progress));
    return;
  }
  installHalftoneSheet(maskDataUrlForProgress("halftone", progress, f.origin));
}

function retarget(f: Flight, to: 0 | 1, now: number): void {
  const progress = sample(f, now);
  f.from = progress;
  f.to = to;
  f.t0 = now;
  f.dur = Math.max(16, Math.abs(to - progress) * f.fullMs);
  scheduleEnd(f);
}

/** Frames drive the stipple. A timer is the backstop so a stalled
 *  requestAnimationFrame cannot leave the snapshot up for the hold's 60s. */
function scheduleEnd(f: Flight): void {
  window.clearTimeout(f.timer);
  f.timer = window.setTimeout(() => {
    if (flight === f) tick(f);
  }, f.dur + 48);
}

function endViewTransition(vt: ViewTransition): void {
  try {
    vt.skipTransition();
    return;
  } catch {
    /* already finished or unsupported */
  }
  for (const anim of document.getAnimations()) {
    if ("animationName" in anim && anim.animationName === "theme-vt-hold") anim.cancel();
  }
}

function settle(f: Flight, theme: SiteTheme): void {
  if (flight === f) flight = null;
  cancelAnimationFrame(f.raf);
  window.clearTimeout(f.timer);
  if (readTheme() !== theme) commitTheme(theme);
  endViewTransition(f.vt);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (flight) return;
      document.documentElement.classList.remove("theme-switching");
    });
  });
  const waiters = f.pending;
  f.pending = [];
  for (const resolve of waiters) resolve();
  // Keep the mask until the snapshot is gone so the last frame can't flash
  // an unmasked layer. A newer flight installs its own sheet and wins.
  requestAnimationFrame(() => {
    if (flight) return;
    clearVtStyles();
  });
}

function armClock(f: Flight, now: number): void {
  f.visible = true;
  f.from = 0;
  f.to = f.to === 0 ? 0 : 1;
  f.t0 = now - (f.to === 1 ? START_LEAD_MS : 0);
  f.dur = Math.max(16, Math.abs(f.to - f.from) * f.fullMs);
  paint(f, sample(f, now));
  f.raf = requestAnimationFrame(() => tick(f));
  scheduleEnd(f);
}

function tick(f: Flight): void {
  if (flight !== f) return;
  const now = performance.now();
  const progress = sample(f, now);
  paint(f, progress);
  const done = (f.to === 1 && progress >= 1) || (f.to === 0 && progress <= 0);
  if (done) {
    settle(f, f.to === 1 ? f.themeAt1 : f.themeAt0);
    return;
  }
  f.raf = requestAnimationFrame(() => tick(f));
}

function begin(
  nextTheme: SiteTheme,
  mode: MaskMode,
  origin: Point,
  resolve: () => void,
): void {
  const themeAt0 = readTheme();
  const themeAt1 = nextTheme;
  const fullMs = mode === "dither" ? DITHER_DURATION_MS : HALFTONE_MS;
  const frames = mode === "dither" ? warmDitherFrames(origin) : null;

  const html = document.documentElement;
  html.setAttribute("data-theme-transition", mode);
  html.style.setProperty("--theme-transition-duration", `${fullMs}ms`);

  if (mode === "dither" && frames) {
    installDitherSheet();
    const lead = frames.urls[1] ?? frames.urls[0];
    applyDitherMask(lead);
  } else {
    installHalftoneSheet(maskDataUrlForProgress("halftone", 0, origin));
  }

  const startViewTransition = document.startViewTransition?.bind(document);
  if (!startViewTransition) {
    clearVtStyles();
    void crossfadeFallback(() => applyThemeInstant(themeAt1), 180).then(resolve);
    return;
  }

  let vt: ViewTransition;
  try {
    vt = startViewTransition(() => {
      commitTheme(themeAt1);
    });
  } catch {
    clearVtStyles();
    document.documentElement.classList.remove("theme-switching");
    void crossfadeFallback(() => applyThemeInstant(themeAt1), 180).then(resolve);
    return;
  }

  const next: Flight = {
    mode,
    origin,
    fullMs,
    from: 0,
    to: 1,
    t0: 0,
    dur: fullMs,
    themeAt0,
    themeAt1,
    frames,
    vt,
    raf: 0,
    timer: 0,
    lastFrame: -1,
    pending: [resolve],
    overlay: frames ? ensureOverlay(frames) : null,
    visible: false,
  };
  flight = next;

  vt.ready.then(() => {
    if (flight !== next) return;
    armClock(next, performance.now());
  }).catch(() => {
    if (flight === next) settle(next, next.to === 0 ? next.themeAt0 : next.themeAt1);
  });
}

async function crossfadeFallback(apply: () => void, durationMs: number): Promise<void> {
  const veil = document.createElement("div");
  veil.setAttribute("aria-hidden", "true");
  Object.assign(veil.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483646",
    pointerEvents: "none",
    background: "var(--color-bg)",
    opacity: "0",
    transition: `opacity ${durationMs}ms ease-out`,
  });
  document.body.appendChild(veil);
  // Force the initial opacity to commit before the fade-in.
  void veil.offsetWidth;
  veil.style.opacity = "1";
  await new Promise((r) => setTimeout(r, durationMs * 0.45));
  apply();
  await new Promise((r) => setTimeout(r, durationMs * 0.1));
  veil.style.opacity = "0";
  await new Promise((r) => setTimeout(r, durationMs * 0.45));
  veil.remove();
}

export type RunThemeTransitionOptions = {
  mode: ThemeTransitionMode;
  origin?: { x: number; y: number };
  reducedMotion?: boolean;
};

/**
 * Swaps `data-theme`. Dither and halftone reveal through a View Transition
 * mask. A second call while one is running reverses from the current
 * progress instead of waiting or restarting at 0.
 */
export function runThemeTransition(
  nextTheme: SiteTheme,
  options: RunThemeTransitionOptions,
): Promise<void> {
  const { mode, reducedMotion } = options;
  const origin = options.origin ?? {
    x: window.innerWidth - 48,
    y: 48,
  };

  if (mode === "default") {
    if (flight) settle(flight, nextTheme);
    else applyThemeInstant(nextTheme);
    return Promise.resolve();
  }

  if (reducedMotion) {
    if (flight) settle(flight, nextTheme);
    return crossfadeFallback(() => applyThemeInstant(nextTheme), 150);
  }

  installToggleForwarder();

  const active = flight;
  if (active && active.mode === mode && (nextTheme === active.themeAt0 || nextTheme === active.themeAt1)) {
    return new Promise((resolve) => {
      const to: 0 | 1 = nextTheme === active.themeAt1 ? 1 : 0;
      active.pending.push(resolve);
      if (!active.visible) {
        // Snapshot isn't on screen yet. Reversing cancels; otherwise keep going.
        if (to === 0) settle(active, active.themeAt0);
        return;
      }
      if (to !== active.to) {
        const now = performance.now();
        retarget(active, to, now);
        if (readTheme() !== nextTheme) commitTheme(nextTheme);
        paint(active, sample(active, performance.now()));
      }
    });
  }

  if (active) settle(active, nextTheme);

  return new Promise((resolve) => {
    begin(nextTheme, mode, origin, resolve);
  });
}

export function warmThemeTransition(origin: Point): void {
  warmDitherFrames(origin);
}
