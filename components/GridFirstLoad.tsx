"use client";

import { useState, useEffect, useLayoutEffect as _useLayoutEffect } from "react";

// SSR-safe useLayoutEffect: fires before paint on client, falls back to useEffect on server.
const useLayoutEffect = typeof window !== "undefined" ? _useLayoutEffect : useEffect;

// Module-level: set to true only after the intro completes (onDone), not before.
// This ensures the listener is correctly re-registered in React StrictMode's
// double-invocation, since _shown stays false until the intro actually plays.
let _shown = false;

/** Computes whether the work-page grid should be revealed right now.
 *
 *  First load with the intro gate active (data-intro="playing", set by an
 *  inline script in app/layout.tsx only when the very first page load is
 *  "/") → stays inactive until "intro-done" fires, so the grid waits for
 *  the deliberate hero+PS3Silk intro moment before it starts its own
 *  entrance stagger.
 *
 *  Everything else (nav-return from about/playground, case-study "Back",
 *  or any first load that isn't "/") → active immediately. The caller
 *  (PersistentWorkShell) is responsible for choosing *how* that reveal
 *  looks — animated via EntranceStagger, or instant for the "Back" case.
 *
 *  Hydration-safe: always starts true on server (matching server HTML — no
 *  flash of hidden content). useLayoutEffect fires before first paint and
 *  flips to false if the intro gate is actually active.
 *
 *  StrictMode-safe: _shown is only set inside onDone (not before listener
 *  registration), so the second effect invocation re-registers correctly. */
export function useGridFirstLoadActive(): boolean {
  const [active, setActive] = useState(true);

  useLayoutEffect(() => {
    // Nav return: intro already played, reveal immediately.
    if (_shown) return;

    // No intro active (non-home first load, or intro already cleared).
    if (!document.documentElement.hasAttribute("data-intro")) {
      _shown = true;
      return;
    }

    // First load with intro: hide grid immediately before first paint.
    setActive(false);

    const onDone = () => {
      _shown = true;
      setActive(true);
    };
    window.addEventListener("intro-done", onDone, { once: true });

    return () => window.removeEventListener("intro-done", onDone);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate effect: listen for in-place replay and restart the intro sequence.
  useEffect(() => {
    const onReplay = () => {
      _shown = false;
      setActive(false);
      const onDone = () => {
        _shown = true;
        setActive(true);
      };
      window.addEventListener("intro-done", onDone, { once: true });
    };
    window.addEventListener("intro-replay", onReplay as EventListener);
    return () => window.removeEventListener("intro-replay", onReplay as EventListener);
  }, []);

  return active;
}
