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

function setNewLayerMask(url: string): void {
  const sheet = ensureVtStyleSheet();
  sheet.textContent = `
    ::view-transition-old(root) {
      animation: none !important;
      z-index: 1;
    }
    ::view-transition-new(root) {
      animation: none !important;
      z-index: 2;
      mask-image: url("${url}");
      mask-size: 100% 100%;
      mask-repeat: no-repeat;
      mask-mode: alpha;
      -webkit-mask-image: url("${url}");
      -webkit-mask-size: 100% 100%;
      -webkit-mask-repeat: no-repeat;
    }
  `;
}

function clearVtStyles(): void {
  const el = document.getElementById(VT_STYLE_ID);
  if (el) el.textContent = "";
  document.documentElement.removeAttribute("data-theme-transition");
}

function animateMask(
  mode: Exclude<ThemeTransitionMode, "default">,
  origin: { x: number; y: number },
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const p = easeOutCubic(t);
      setNewLayerMask(maskDataUrlForProgress(mode, p, origin));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    setNewLayerMask(maskDataUrlForProgress(mode, 0, origin));
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

  document.documentElement.setAttribute("data-theme-transition", mode);

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
