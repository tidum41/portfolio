import {
  applyThemeInstant,
  commitTheme,
  type SiteTheme,
} from "./applyTheme";
import type { Point } from "./bayer";
import { DITHER_CELL_PX, DITHER_DURATION_MS, ditherRevealKeyframes } from "./ditherMask";
import { maskDataUrlForProgress } from "./maskCanvas";
import type { ThemeTransitionMode } from "./preference";

const VT_STYLE_ID = "theme-transition-vt-style";
const HALFTONE_MS = 500;
/** Halftone only. Dither's first keyframe is already the hidden state. */
const START_LEAD_MS = 16;
const REVEAL_NAME = "theme-dither-reveal";
const HOLD_NAME = "theme-vt-hold";

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
  vt: ViewTransition;
  raf: number;
  timer: number;
  pending: Array<() => void>;
  /** False until the snapshot is on screen. Clicks before that cancel or retarget without advancing the clock. */
  visible: boolean;
};

type NamedAnim = Animation & { animationName: string };

let flight: Flight | null = null;
let toggleForwarder = false;

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

function pointerCss(): string {
  return `
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
  `;
}

function holdKeyframes(): string {
  return `
    @keyframes ${HOLD_NAME} {
      from { opacity: 1; }
      to { opacity: 1; }
    }
  `;
}

function installDitherSheet(): void {
  const el = ensureVtStyleSheet();
  if (el.dataset.kind === "dither" && el.textContent) return;
  el.dataset.kind = "dither";
  const tile = DITHER_CELL_PX * 8;
  el.textContent = `
    ${holdKeyframes()}
    @keyframes ${REVEAL_NAME} {
      ${ditherRevealKeyframes()}
    }
    ${pointerCss()}
    ::view-transition-group(root),
    ::view-transition-old(root) {
      animation: ${HOLD_NAME} 3s linear forwards;
      mix-blend-mode: normal;
    }
    ::view-transition-old(root) {
      opacity: 1;
      z-index: 1;
    }
    ::view-transition-new(root) {
      animation: ${REVEAL_NAME} ${DITHER_DURATION_MS}ms linear both;
      mix-blend-mode: normal;
      opacity: 1;
      z-index: 2;
      mask-size: ${tile}px ${tile}px;
      mask-repeat: repeat;
      mask-position: 0 0;
      mask-mode: luminance;
      -webkit-mask-size: ${tile}px ${tile}px;
      -webkit-mask-repeat: repeat;
      -webkit-mask-position: 0 0;
      -webkit-mask-source-type: luminance;
    }
  `;
}

function installHalftoneSheet(url: string): void {
  const el = ensureVtStyleSheet();
  el.dataset.kind = "halftone";
  el.textContent = `
    ${holdKeyframes()}
    ${pointerCss()}
    ::view-transition-group(root) {
      animation: ${HOLD_NAME} 60s linear infinite;
    }
    ::view-transition-old(root) {
      animation: ${HOLD_NAME} 60s linear infinite;
      mix-blend-mode: normal;
      opacity: 1;
      z-index: 1;
    }
    ::view-transition-new(root) {
      animation: ${HOLD_NAME} 60s linear infinite;
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
  // The dither sheet is one precomputed animation. Wiping it makes the next
  // click parse every tile again, which is the hitch this path is avoiding.
  if (el && el.dataset.kind !== "dither") el.textContent = "";
  const html = document.documentElement;
  html.removeAttribute("data-theme-transition");
  html.style.removeProperty("--theme-dither-mask");
  html.style.removeProperty("--theme-transition-duration");
}

function namedAnimations(): NamedAnim[] {
  const out: NamedAnim[] = [];
  for (const anim of document.getAnimations()) {
    if (!("animationName" in anim)) continue;
    const name = (anim as { animationName?: unknown }).animationName;
    if (name !== REVEAL_NAME && name !== HOLD_NAME) continue;
    out.push(anim as NamedAnim);
  }
  return out;
}

function setDitherPlayback(to: 0 | 1): void {
  const rate = to === 1 ? 1 : -1;
  // Only the mask animation reverses. Reversing the opacity hold finishes
  // the view transition immediately, which cuts the dissolve off.
  for (const anim of namedAnimations()) {
    if (anim.animationName === REVEAL_NAME) anim.playbackRate = rate;
  }
}

function revealCurrentTime(): number {
  const reveal = namedAnimations().find((anim) => anim.animationName === REVEAL_NAME);
  const time = Number(reveal?.currentTime);
  return Number.isFinite(time) ? time : 0;
}

/** Backstop only. Read the clock before flipping playbackRate — after a
 *  reverse, currentTime can report 0 for a frame and a short timer would
 *  skip the dissolve before it plays backward. */
function watchReveal(f: Flight): void {
  const reveal = namedAnimations().find((anim) => anim.animationName === REVEAL_NAME);
  if (!reveal) return;
  reveal.finished.then(() => {
    if (flight === f) settle(f, f.to === 1 ? f.themeAt1 : f.themeAt0);
  }).catch(() => {
    /* playbackRate changes can replace the promise; the timer still settles */
  });
}

function scheduleDitherEnd(f: Flight, remainingMs: number): void {
  window.clearTimeout(f.timer);
  f.timer = window.setTimeout(() => {
    if (flight !== f) return;
    const reveal = namedAnimations().find((anim) => anim.animationName === REVEAL_NAME);
    const time = revealCurrentTime();
    const atBoundary = f.to === 1 ? time >= DITHER_DURATION_MS - 24 : time <= 24;
    if (reveal && !atBoundary) {
      const left = f.to === 1 ? DITHER_DURATION_MS - time : time;
      scheduleDitherEnd(f, left);
      return;
    }
    settle(f, f.to === 1 ? f.themeAt1 : f.themeAt0);
  }, Math.max(48, remainingMs) + 90);
}

function sample(f: Flight, now: number): number {
  const u = f.dur <= 0 ? 1 : Math.min(1, (now - f.t0) / f.dur);
  if (u >= 1) return f.to;
  const eased = easeOutCubic(u);
  return f.from + (f.to - f.from) * eased;
}

function paintHalftone(f: Flight, progress: number): void {
  installHalftoneSheet(maskDataUrlForProgress("halftone", progress, f.origin));
}

function retargetHalftone(f: Flight, to: 0 | 1, now: number): void {
  const progress = sample(f, now);
  f.from = progress;
  f.to = to;
  f.t0 = now;
  f.dur = Math.max(16, Math.abs(to - progress) * f.fullMs);
  scheduleHalftoneEnd(f);
}

/** Frames drive the stipple. A timer is the backstop so a stalled
 *  requestAnimationFrame cannot leave the snapshot up for the hold's 60s. */
function scheduleHalftoneEnd(f: Flight): void {
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
  for (const anim of namedAnimations()) anim.cancel();
}

function settle(f: Flight, theme: SiteTheme): void {
  if (flight !== f) return;
  flight = null;
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

function armHalftoneClock(f: Flight, now: number): void {
  f.visible = true;
  f.from = 0;
  f.to = f.to === 0 ? 0 : 1;
  f.t0 = now - (f.to === 1 ? START_LEAD_MS : 0);
  f.dur = Math.max(16, Math.abs(f.to - f.from) * f.fullMs);
  paintHalftone(f, sample(f, now));
  f.raf = requestAnimationFrame(() => tick(f));
  scheduleHalftoneEnd(f);
}

function tick(f: Flight): void {
  if (flight !== f || f.mode !== "halftone") return;
  const now = performance.now();
  const progress = sample(f, now);
  paintHalftone(f, progress);
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

  const html = document.documentElement;
  html.setAttribute("data-theme-transition", mode);
  html.style.setProperty("--theme-transition-duration", `${fullMs}ms`);

  if (mode === "dither") installDitherSheet();
  else installHalftoneSheet(maskDataUrlForProgress("halftone", 0, origin));

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
    vt,
    raf: 0,
    timer: 0,
    pending: [resolve],
    visible: false,
  };
  flight = next;

  if (mode === "dither") {
    vt.finished.then(
      () => {
        if (flight === next) settle(next, next.to === 1 ? next.themeAt1 : next.themeAt0);
      },
      () => {
        /* skipTransition rejects an already-finished transition */
      },
    );
  }

  vt.ready.then(() => {
    if (flight !== next) return;
    if (next.mode === "dither") {
      next.visible = true;
      watchReveal(next);
      scheduleDitherEnd(next, Math.max(0, DITHER_DURATION_MS - revealCurrentTime()));
      return;
    }
    armHalftoneClock(next, performance.now());
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
 * Swaps `data-theme`. Dither reveals through one repeating Bayer tile on the
 * view-transition snapshot; a second call reverses that CSS animation from
 * the current frame. Halftone still steps a mask on requestAnimationFrame.
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
        if (to === 0) settle(active, active.themeAt0);
        return;
      }
      if (to === active.to) return;
      if (active.mode === "dither") {
        const time = revealCurrentTime();
        active.to = to;
        setDitherPlayback(to);
        const remaining = to === 0 ? time : DITHER_DURATION_MS - time;
        watchReveal(active);
        scheduleDitherEnd(active, remaining);
        if (readTheme() !== nextTheme) commitTheme(nextTheme);
        return;
      }
      const now = performance.now();
      retargetHalftone(active, to, now);
      if (readTheme() !== nextTheme) commitTheme(nextTheme);
      paintHalftone(active, sample(active, performance.now()));
    });
  }

  if (active) settle(active, nextTheme);

  return new Promise((resolve) => {
    begin(nextTheme, mode, origin, resolve);
  });
}

export function warmThemeTransition(_origin: Point): void {
  ditherRevealKeyframes();
  if (typeof document !== "undefined") installDitherSheet();
}
