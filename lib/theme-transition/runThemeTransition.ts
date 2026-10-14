import { applyThemeInstant, type SiteTheme } from "./applyTheme";
import { maskDataUrlForProgress } from "./maskCanvas";
import type { ThemeTransitionMode } from "./preference";

const VT_STYLE_ID = "theme-transition-vt-style";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
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

function setNewLayerMask(url: string, pixelated: boolean): void {
  const sheet = ensureVtStyleSheet();
  const crisp = pixelated
    ? `
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    `
    : "";
  sheet.textContent = `
    ::view-transition-group(root) {
      animation-duration: var(--theme-transition-duration, 550ms);
      animation-timing-function: linear;
    }
    ::view-transition-old(root) {
      animation: none !important;
      z-index: 1;
      opacity: 1 !important;
    }
    ::view-transition-new(root) {
      animation: none !important;
      opacity: 1 !important;
      z-index: 2;
      mask-image: url("${url}");
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      /* Opaque PNG tiles: alpha is always 255 — luminance uses RGB for coverage. */
      mask-mode: luminance;
      -webkit-mask-image: url("${url}");
      -webkit-mask-size: 100% 100%;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-source-type: luminance;
      ${crisp}
    }
  `;
}

function clearVtStyles(): void {
  const el = document.getElementById(VT_STYLE_ID);
  if (el) el.textContent = "";
  const html = document.documentElement;
  html.removeAttribute("data-theme-transition");
  html.style.removeProperty("--theme-transition-duration");
}

function animateMask(
  mode: Exclude<ThemeTransitionMode, "default">,
  origin: { x: number; y: number },
  durationMs: number,
): Promise<void> {
  const pixelated = mode === "dither";
  return new Promise((resolve) => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const p = easeOutCubic(t);
      setNewLayerMask(maskDataUrlForProgress(mode, p, origin), pixelated);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    setNewLayerMask(maskDataUrlForProgress(mode, 0, origin), pixelated);
    raf = requestAnimationFrame(tick);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  veil.offsetWidth;
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
 * Swaps `data-theme` with an optional prototype transition. `default` or
 * reduced-motion uses the existing instant snap (no View Transition).
 */
export async function runThemeTransition(
  nextTheme: SiteTheme,
  options: RunThemeTransitionOptions,
): Promise<void> {
  const { mode, reducedMotion } = options;
  const origin = options.origin ?? {
    x: window.innerWidth - 48,
    y: 48,
  };

  const apply = () => applyThemeInstant(nextTheme);

  if (mode === "default") {
    apply();
    return;
  }

  if (reducedMotion) {
    await crossfadeFallback(apply, 150);
    return;
  }

  const durationMs = mode === "dither" ? 550 : 500;
  const startViewTransition = document.startViewTransition?.bind(document);

  if (!startViewTransition) {
    await crossfadeFallback(apply, 180);
    return;
  }

  const html = document.documentElement;
  html.setAttribute("data-theme-transition", mode);
  html.style.setProperty("--theme-transition-duration", `${durationMs}ms`);

  const transition = startViewTransition(() => {
    apply();
  });

  try {
    await transition.ready;
    await animateMask(mode, origin, durationMs);
    await transition.finished;
  } finally {
    clearVtStyles();
  }
}
