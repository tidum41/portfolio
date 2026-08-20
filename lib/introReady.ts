/** Intro gate helpers — first load on "/" sets data-intro="playing" until
 *  `intro-done`. Other routes (and post-intro) are already released. */

export function introIsPlaying(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-intro") === "playing"
  );
}

/** Run `cb` now, or once on `intro-done` if the gate is still closed. */
export function onIntroDone(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (!introIsPlaying()) {
    cb();
    return () => {};
  }
  window.addEventListener("intro-done", cb, { once: true });
  return () => window.removeEventListener("intro-done", cb);
}

/** After intro (and idle), run `cb`. Used to prefetch About/Archive off the
 *  first-load critical path without changing later-nav keep-alive. */
export function afterIntroIdle(cb: () => void, timeout = 2500): () => void {
  let idleId = 0;
  let timeoutId = 0;
  const start = () => {
    if (typeof requestIdleCallback === "function") {
      idleId = requestIdleCallback(() => cb(), { timeout });
    } else {
      timeoutId = window.setTimeout(cb, Math.min(timeout, 800));
    }
  };
  const cancelIntro = onIntroDone(start);
  return () => {
    cancelIntro();
    if (idleId && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(idleId);
    }
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
