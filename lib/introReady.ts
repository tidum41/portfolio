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

/** After intro (and idle), run `cb`. Used to prefetch About/Archive off the
 *  first-load critical path without changing later-nav keep-alive. */
export function afterIntroIdle(cb: () => void, timeout = 6000): () => void {
  let idleId = 0;
  let timeoutId = 0;
  let settleId = 0;
  const wasIntroPlaying = introIsPlaying();
  const effectiveTimeout = Math.max(timeout, 6000);
  const scheduleIdle = () => {
    if (typeof requestIdleCallback === "function") {
      idleId = requestIdleCallback(() => cb(), { timeout: effectiveTimeout });
    } else {
      timeoutId = window.setTimeout(cb, Math.min(effectiveTimeout, 1500));
    }
  };
  const start = () => {
    // `intro-done` fires at gateDuration (1.9s), while the silk fade (2.3s)
    // and grid reveal (0.7s) finish around ~2.6–3.0s. When armed during the
    // first-load intro, wait until the 3s startup window has cleared before
    // requesting an idle callback (since 30fps silk leaves alternate 16ms
    // frames looking idle to requestIdleCallback).
    if (wasIntroPlaying) {
      const waitMs = Math.max(900, 3150 - performance.now());
      settleId = window.setTimeout(scheduleIdle, waitMs);
    } else {
      scheduleIdle();
    }
  };
  const cancelIntro = onIntroDone(start);
  return () => {
    cancelIntro();
    if (settleId) window.clearTimeout(settleId);
    if (idleId && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(idleId);
    }
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
