"use client";

import { useEffect } from "react";
import { completeIntro } from "@/lib/introReady";

/** Drop this anywhere on the home page. Manages the first-load intro sequence:
 *  - BootScripts injects the theme/intro gate script before first paint
 *    (via useServerInsertedHTML) so data-intro="playing" is cleared off-home
 *  - Listens for "ps3-silk-intro-complete" from PS3Silk when the shader fade
 *    completes, invoking completeIntro() to broadcast "intro-done"
 *  - Maintains a 3500ms safety fallback timeout in case WebGL context fails
 *  - Also listens for "intro-replay" to restart the sequence in-place
 *  - Early project-card clicks call completeIntro() directly; completeIntro()
 *    no-ops once the attribute is no longer "playing"
 *
 *  StrictMode-safe: cleanup clears timeout and listener; attribute stays "playing"
 *  so the double-invoked effect restarts correctly. */
export function IntroOrchestrator() {
  useEffect(() => {
    const html = document.documentElement;
    let fallbackTimer: ReturnType<typeof setTimeout>;

    function onSilkComplete() {
      clearTimeout(fallbackTimer);
      completeIntro();
    }

    function run() {
      if (!html.hasAttribute("data-intro")) return;
      clearTimeout(fallbackTimer);
      window.removeEventListener("ps3-silk-intro-complete", onSilkComplete);

      window.addEventListener("ps3-silk-intro-complete", onSilkComplete, { once: true });
      fallbackTimer = setTimeout(() => {
        completeIntro();
      }, 3500);
    }

    run();

    const onReplay = () => run();
    window.addEventListener("intro-replay", onReplay as EventListener);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("ps3-silk-intro-complete", onSilkComplete);
      window.removeEventListener("intro-replay", onReplay as EventListener);
    };
  }, []);

  return null;
}
