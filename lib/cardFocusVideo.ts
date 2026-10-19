/**
 * Card-focus playback policy for homepage grid videos.
 * Guards against late autoplay winning over controller pause().
 */

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

/** When card focus is active, only the focused grid card may autoplay. */
export function cardFocusAllowsVideoPlay(video: HTMLVideoElement): boolean {
  if (typeof document === "undefined") return true;
  if (!document.documentElement.hasAttribute("data-card-focus")) return true;
  const card = video.closest(".portfolio-grid-card");
  return Boolean(card?.hasAttribute("data-card-focus-active"));
}

/** Pause immediately when focus forbids this video. */
export function enforceCardFocusOnVideo(video: HTMLVideoElement): void {
  if (cardFocusAllowsVideoPlay(video)) return;
  try {
    video.pause();
  } catch {
    /* ignore */
  }
  const mux = video.closest("mux-player");
  if (mux) pauseMuxHost(mux);
}

const onGuardedPlay = (e: Event) => {
  const video = e.currentTarget as HTMLVideoElement;
  enforceCardFocusOnVideo(video);
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
  for (const card of grid.querySelectorAll(".portfolio-grid-card")) {
    for (const v of card.querySelectorAll<HTMLVideoElement>("video")) {
      bindCardFocusVideoGuard(v);
    }
    for (const mux of card.querySelectorAll("mux-player")) {
      const sr = mux.shadowRoot;
      const v = sr?.querySelector("video") ?? mux.querySelector("video");
      if (v instanceof HTMLVideoElement) bindCardFocusVideoGuard(v);
    }
  }
}

/**
 * Capture-phase grid listeners + MutationObserver for late-mounted videos.
 */
export function mountCardFocusVideoGuards(grid: HTMLElement): () => void {
  const onCapturePlay = (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLVideoElement)) return;
    if (!grid.contains(target)) return;
    enforceCardFocusOnVideo(target);
  };

  grid.addEventListener("play", onCapturePlay, true);
  grid.addEventListener("playing", onCapturePlay, true);
  scanGridVideos(grid);

  const mo = new MutationObserver(() => scanGridVideos(grid));
  mo.observe(grid, { childList: true, subtree: true });

  return () => {
    grid.removeEventListener("play", onCapturePlay, true);
    grid.removeEventListener("playing", onCapturePlay, true);
    mo.disconnect();
  };
}

/** Play only when allowed; re-pause if focus changes before the promise settles. */
export function cardFocusPlay(video: HTMLVideoElement): void {
  if (!cardFocusAllowsVideoPlay(video)) {
    enforceCardFocusOnVideo(video);
    return;
  }
  video.muted = true;
  let attempt: Promise<void> | undefined;
  try {
    attempt = video.play();
  } catch {
    return;
  }
  if (attempt && typeof attempt.then === "function") {
    attempt
      .then(() => {
        if (!cardFocusAllowsVideoPlay(video)) enforceCardFocusOnVideo(video);
      })
      .catch(() => {});
  }
}
