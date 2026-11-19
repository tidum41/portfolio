import { INTRO_POST_GATE_SETTLE_MS } from "@/lib/introTimings";

/** Intro gate helpers — first load on "/" sets data-intro="playing" until
 *  `intro-done`. Other routes (and post-intro) are already released. */

export function introIsPlaying(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-intro") === "playing"
  );
}

/** Check if the first-load intro has completed. */
export function isIntroComplete(): boolean {
  return !introIsPlaying();
}

/** Alias for onIntroDone satisfying introReady contract. */
export const whenIntroComplete = onIntroDone;


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
    // `intro-done` fires at visual completion (~0.9s), then the grid reveal
    // (stagger spread + card duration) runs ~1.3s. When armed during the
    // first-load intro, wait that long after `intro-done` (relative, not an
    // absolute page time) before requesting an idle callback — 30fps silk
    // leaves alternate 16ms frames looking idle to requestIdleCallback.
    if (wasIntroPlaying) {
      settleId = window.setTimeout(scheduleIdle, INTRO_POST_GATE_SETTLE_MS);
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
