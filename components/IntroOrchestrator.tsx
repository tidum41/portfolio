"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { completeIntro, isIntroComplete } from "@/lib/introReady";
import { introTimings } from "@/lib/introTimings";

/** Drop this anywhere on the home page. Manages the first-load intro sequence:
 *  - BootScripts injects the theme/intro gate script before first paint
 *    (via useServerInsertedHTML) so data-intro="playing" is cleared off-home
 *  - Listens for "ps3-silk-intro-complete" from PS3Silk when the shader fade
 *    completes, invoking completeIntro() to broadcast "intro-done"
 *  - Maintains a 3500ms safety fallback timeout tied to introTimings.gateDuration
 *    in case WebGL context fails
 *  - Also listens for "intro-replay" to restart the sequence in-place
 *  - Early project-card clicks call completeIntro() directly; completeIntro()
 *    no-ops once the attribute is no longer "playing"
 *  - Navigating away from home cancels pending timers and completes intro cleanly
 *  - Returning to "/" or restoring via bfcache releases intro gate immediately
 *
 *  StrictMode-safe: cleanup clears timeout and listener; attribute stays "playing"
 *  so the double-invoked effect restarts correctly. */
export function IntroOrchestrator() {
  const pathname = usePathname();
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompletedOrDepartedRef = useRef(false);

  // Route navigation handling:
  // - When leaving "/": cancel pending timers and complete intro cleanly
  // - When returning to "/": if intro was already played or completed, complete intro immediately
  useEffect(() => {
    if (pathname !== "/") {
      hasCompletedOrDepartedRef.current = true;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      completeIntro();
    } else if (hasCompletedOrDepartedRef.current || isIntroComplete()) {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      completeIntro();
    }
  }, [pathname]);

  // Handle browser back-forward cache (bfcache) restoration
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        hasCompletedOrDepartedRef.current = true;
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        completeIntro();
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    function onSilkComplete() {
      hasCompletedOrDepartedRef.current = true;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      completeIntro();
    }

    function onSoftNav() {
      hasCompletedOrDepartedRef.current = true;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      completeIntro();
    }

    function run() {
      if (!html.hasAttribute("data-intro")) return;
      hasCompletedOrDepartedRef.current = false;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      window.removeEventListener("ps3-silk-intro-complete", onSilkComplete);

      window.addEventListener("ps3-silk-intro-complete", onSilkComplete, { once: true });
      window.addEventListener("soft-nav-start", onSoftNav, { once: true });

      // Backed by 3500ms safety timeout fallback tied to introTimings.gateDuration
      const fallbackDelay = Math.max(3500, introTimings.gateDuration * 1000);
      fallbackTimerRef.current = setTimeout(() => {
        hasCompletedOrDepartedRef.current = true;
        completeIntro();
      }, fallbackDelay);
    }

    run();

    const onReplay = () => run();
    window.addEventListener("intro-replay", onReplay as EventListener);

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      window.removeEventListener("ps3-silk-intro-complete", onSilkComplete);
      window.removeEventListener("soft-nav-start", onSoftNav);
      window.removeEventListener("intro-replay", onReplay as EventListener);
    };
  }, []);

  return null;
}
