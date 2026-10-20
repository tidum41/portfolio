/**
 * Card-focus playback policy for homepage grid videos.
 *
 * - While a card is focused, every other grid video is paused and recorded in
 *   `pausedByFocus`. On neutral the controller resumes exactly that set.
 * - Late autoplay (hls.js attach, canplay, play() promises) cannot restart a
 *   video the policy forbids: play/playing are intercepted and re-paused.
 */

/** Videos the focus policy paused (or blocked from starting). Resumed on neutral. */
export const pausedByFocus = new Set<HTMLVideoElement>();

const boundVideos = new WeakSet<HTMLVideoElement>();

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

/** When card focus is active, only the focused grid card may play. */
export function cardFocusAllowsVideoPlay(video: HTMLVideoElement): boolean {
  if (typeof document === "undefined") return true;
  if (!document.documentElement.hasAttribute("data-card-focus")) return true;
  const card = video.closest(".portfolio-grid-card");
  return Boolean(card?.hasAttribute("data-card-focus-active"));
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

const onGuardedPlay = (e: Event) => {
  enforceCardFocusOnVideo(e.currentTarget as HTMLVideoElement);
};

/** Per-element play/playing listeners (survives late attach). */
export function bindCardFocusVideoGuard(video: HTMLVideoElement): void {
  if (boundVideos.has(video)) return;
  boundVideos.add(video);
  video.addEventListener("play", onGuardedPlay);
  video.addEventListener("playing", onGuardedPlay);
  enforceCardFocusOnVideo(video);
}

function scanGridVideos(grid: HTMLElement): void {
  for (const v of collectCardVideos(grid)) bindCardFocusVideoGuard(v);
}

function mutationHasVideo(records: MutationRecord[]): boolean {
  for (const r of records) {
    for (const node of r.addedNodes) {
      if (node.nodeType !== 1) continue;
      const el = node as Element;
      if (
        el.tagName === "VIDEO" ||
        el.tagName === "MUX-PLAYER" ||
        el.querySelector?.("video, mux-player")
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Capture-phase grid listeners + MutationObserver for late-mounted videos. */
export function mountCardFocusVideoGuards(
  grid: HTMLElement,
  onVideosAdded?: () => void,
): () => void {
  const onCapturePlay = (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLVideoElement)) return;
    if (!grid.contains(target)) return;
    enforceCardFocusOnVideo(target);
  };

  grid.addEventListener("play", onCapturePlay, true);
  grid.addEventListener("playing", onCapturePlay, true);
  scanGridVideos(grid);

  const mo = new MutationObserver((records) => {
    if (!mutationHasVideo(records)) return;
    scanGridVideos(grid);
    onVideosAdded?.();
  });
  mo.observe(grid, { childList: true, subtree: true });

  return () => {
    grid.removeEventListener("play", onCapturePlay, true);
    grid.removeEventListener("playing", onCapturePlay, true);
    mo.disconnect();
  };
}

function retryPlayOnce(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    window.setTimeout(() => cardFocusPlay(video, false), 24);
    return;
  }
  const onReady = () => {
    video.removeEventListener("loadeddata", onReady);
    video.removeEventListener("canplay", onReady);
    cardFocusPlay(video, false);
  };
  video.addEventListener("loadeddata", onReady, { once: true });
  video.addEventListener("canplay", onReady, { once: true });
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
