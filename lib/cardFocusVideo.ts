/**
 * Card-focus playback policy for homepage grid videos.
 *
 * One rule, read from the same DOM state the dim CSS reads: when
 * html[data-card-focus] is set, a video inside a .portfolio-grid-card that is
 * not [data-card-focus-active] must not play. If the dim can apply, so does this.
 *
 * - Every video focus pauses (or blocks from starting) is recorded in
 *   `pausedByFocus`; neutral resumes exactly that set.
 * - The media-event guard lives on `document` (capture), installed by an inline
 *   boot script before hydration and again at module evaluation (idempotent), so
 *   late Mux attach, autoplay and canplay can never outrun it.
 */

import { CARD_FOCUS_GUARD_EVENTS } from "@/lib/cardFocusGuardBoot";

type GuardGlobals = typeof globalThis & {
  __cfPaused?: Set<HTMLVideoElement>;
  __cfGuard?: number;
};
const guardGlobals = globalThis as GuardGlobals;

/** Shared with the inline boot guard (window.__cfPaused). */
export const pausedByFocus: Set<HTMLVideoElement> = (guardGlobals.__cfPaused ??= new Set());

function pauseMuxHost(host: Element) {
  const el = host as HTMLElement & { pause?: () => void };
  if (typeof el.pause === "function") {
    try {
      el.pause();
    } catch {
      /* ignore */
    }
  }
}

/** Every <video> under `root`, including ones inside <mux-player> shadow roots. */
export function collectCardVideos(root: ParentNode): HTMLVideoElement[] {
  const out = new Set<HTMLVideoElement>();
  for (const v of root.querySelectorAll<HTMLVideoElement>("video")) out.add(v);
  for (const mux of root.querySelectorAll("mux-player")) {
    const v = mux.shadowRoot?.querySelector("video") ?? mux.querySelector("video");
    if (v instanceof HTMLVideoElement) out.add(v);
  }
  return [...out];
}

/** Playback the page itself wants stopped (soft-nav leave, reduced motion). */
export function videoWantsPaused(video: HTMLVideoElement): boolean {
  if (video.closest("[data-media-paused]")) return true;
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * True unless this video sits in a dimmed grid card. Videos outside the grid
 * (hero, case studies) are never governed by card focus.
 */
export function cardFocusAllowsVideoPlay(video: HTMLVideoElement): boolean {
  if (typeof document === "undefined") return true;
  if (!document.documentElement.hasAttribute("data-card-focus")) return true;
  const card = video.closest(".portfolio-grid-card");
  if (!card) return true;
  return card.hasAttribute("data-card-focus-active");
}

/** Pause immediately when focus forbids this video, and remember to resume it. */
export function enforceCardFocusOnVideo(video: HTMLVideoElement): void {
  if (cardFocusAllowsVideoPlay(video)) return;
  pausedByFocus.add(video);
  try {
    video.pause();
  } catch {
    /* ignore */
  }
  const mux = video.closest("mux-player");
  if (mux) pauseMuxHost(mux);
}

const onDocumentMedia = (e: Event) => {
  const target = e.target;
  if (target instanceof HTMLVideoElement && !target.paused) enforceCardFocusOnVideo(target);
};

/** Capture media events on document. No-op if the inline boot script already did. */
export function installCardFocusDocumentGuard(): void {
  if (typeof document === "undefined" || guardGlobals.__cfGuard) return;
  guardGlobals.__cfGuard = 1;
  for (const name of CARD_FOCUS_GUARD_EVENTS) document.addEventListener(name, onDocumentMedia, true);
}

installCardFocusDocumentGuard();

/**
 * Enforce focus on videos that mount while a card is already focused. They may
 * not fire play/playing for a while, so don't wait for the event.
 */
export function mountCardFocusVideoGuards(grid: HTMLElement): () => void {
  installCardFocusDocumentGuard();
  const enforceAll = () => {
    for (const v of collectCardVideos(grid)) enforceCardFocusOnVideo(v);
  };
  enforceAll();
  const mo = new MutationObserver(enforceAll);
  mo.observe(grid, { childList: true, subtree: true });
  return () => mo.disconnect();
}

function retryPlayOnce(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    window.setTimeout(() => cardFocusPlay(video, false), 30);
    return;
  }
  video.addEventListener("canplay", () => cardFocusPlay(video, false), { once: true });
}

/**
 * The single play() entry point for grid videos. Respects focus and page-level
 * pause, re-checks after the promise settles, and retries a rejected play()
 * once (AbortError from a racing pause(), or a load that was not ready yet).
 */
export function cardFocusPlay(video: HTMLVideoElement, retry = true): void {
  if (!cardFocusAllowsVideoPlay(video)) {
    enforceCardFocusOnVideo(video);
    return;
  }
  if (videoWantsPaused(video)) return;
  video.muted = true;
  let attempt: Promise<void> | undefined;
  try {
    attempt = video.play();
  } catch {
    if (retry) retryPlayOnce(video);
    return;
  }
  if (attempt && typeof attempt.then === "function") {
    attempt.then(
      () => {
        if (!cardFocusAllowsVideoPlay(video)) enforceCardFocusOnVideo(video);
      },
      () => {
        if (retry) retryPlayOnce(video);
      },
    );
  }
}
