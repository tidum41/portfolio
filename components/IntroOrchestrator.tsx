"use client";

import { useEffect } from "react";
import { introTimings } from "@/lib/introTimings";

/** Drop this anywhere on the home page. Manages the first-load intro sequence:
 *  - The inline <script> in layout.tsx sets data-intro="playing" before first paint
 *  - This component starts the timer (duration from introTimings.gateDuration),
 *    then fires "intro-done" and swaps to "done"
 *  - Also listens for "intro-replay" to restart the sequence in-place
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
        html.setAttribute("data-intro", "done");
        window.dispatchEvent(new CustomEvent("intro-done"));
        setTimeout(() => {
          if (html.getAttribute("data-intro") === "done") html.removeAttribute("data-intro");
        }, 900);
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
