/** Intro gate helpers — first load on "/" sets data-intro="playing" until
 *  `intro-done`. Other routes (and post-intro) are already released. */

export function introIsPlaying(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-intro") === "playing"
  );
}

/** Finish the first-load intro the same way IntroOrchestrator's timer does:
 *  flip to "done", broadcast `intro-done`, then drop the attribute after the
 *  fade window. Idempotent — safe to call from an early project-card click
 *  while the orchestrator timeout is still armed. */
export function completeIntro(): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (html.getAttribute("data-intro") !== "playing") return;
  html.setAttribute("data-intro", "done");
  window.dispatchEvent(new CustomEvent("intro-done"));
  window.setTimeout(() => {
    if (html.getAttribute("data-intro") === "done") html.removeAttribute("data-intro");
  }, 900);
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

/** Run `cb` once the intro gate is open and the window `load` event has
 *  fired, so background work never competes with the page's own first-load
 *  images, fonts and scripts on a slow connection. */
export function onIntroDoneAndLoaded(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let removeLoad = () => {};
  const afterIntro = () => {
    if (document.readyState === "complete") {
      cb();
      return;
    }
    const onLoad = () => cb();
    window.addEventListener("load", onLoad, { once: true });
    removeLoad = () => window.removeEventListener("load", onLoad);
  };
  const cancelIntro = onIntroDone(afterIntro);
  return () => {
    cancelIntro();
    removeLoad();
  };
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
  const cancelIntro = onIntroDoneAndLoaded(start);
  return () => {
    cancelIntro();
    if (idleId && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(idleId);
    }
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
