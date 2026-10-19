/**
 * Card-focus playback policy for homepage grid videos.
 *
 * - While a card is focused, every other grid video is paused and recorded in
 *   `pausedByFocus`. On neutral the controller resumes exactly that set.
 * - Late autoplay (hls.js attach, canplay, play() promises) cannot restart a
 *   video the policy forbids: play/playing are intercepted at the document in
 *   the capture phase and re-paused, and every programmatic play() goes through
 *   cardFocusPlay, so the pause intent holds until focus clears.
 */

/** Videos the focus policy paused (or blocked from starting). Resumed on neutral. */
export const pausedByFocus = new Set<HTMLVideoElement>();

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

const onDocumentPlay = (e: Event) => {
  const target = e.target;
  if (!(target instanceof HTMLVideoElement)) return;
  if (!target.closest(".portfolio-grid-card")) return;
  enforceCardFocusOnVideo(target);
};

let guardInstalled = false;

/**
 * Document-level capture guard for grid videos. Media events do not bubble, but
 * capture sees every video however late hls.js, autoplay or a remount starts
 * it. Installed at module load so it never depends on the grid having mounted;
 * while data-card-focus is set, any grid video outside the active card that
 * starts playing is paused again and queued for resume on hover-off.
 */
export function installCardFocusVideoGuard(): void {
  if (guardInstalled || typeof document === "undefined") return;
  guardInstalled = true;
  document.addEventListener("play", onDocumentPlay, true);
  document.addEventListener("playing", onDocumentPlay, true);
}

installCardFocusVideoGuard();

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
