"use client";

import { useEffect } from "react";
import { completeIntro } from "@/lib/introReady";
import { introTimings } from "@/lib/introTimings";

/** Drop this anywhere on the home page. Manages the first-load intro sequence:
 *  - BootScripts injects the theme/intro gate script before first paint
 *    (via useServerInsertedHTML) so data-intro="playing" is cleared off-home
 *  - This component starts the timer (duration from introTimings.gateDuration),
 *    then fires "intro-done" and swaps to "done"
 *  - Also listens for "intro-replay" to restart the sequence in-place
 *  - Early project-card clicks call completeIntro() directly; the timer
 *    no-ops once the attribute is no longer "playing"
 *
 *  StrictMode-safe: cleanup only clears the timeout; attribute stays "playing"
 *  so the double-invoked effect restarts the timer correctly. */
export function IntroOrchestrator() {
  useEffect(() => {
    const html = document.documentElement;
    let t: ReturnType<typeof setTimeout>;

    function run() {
      if (!html.hasAttribute("data-intro")) return;
      clearTimeout(t);
      t = setTimeout(() => {
        completeIntro();
      }, introTimings.gateDuration * 1000);
    }

    run();

    const onReplay = () => run();
    window.addEventListener("intro-replay", onReplay as EventListener);

    return () => {
      clearTimeout(t);
      window.removeEventListener("intro-replay", onReplay as EventListener);
    };
  }, []);

  return null;
}
