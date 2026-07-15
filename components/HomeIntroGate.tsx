"use client";

import { useEffect } from "react";

// Module-level flag: resets on hard reload, persists through client-side navigation.
// On the first hard load of "/", we wait 1800ms before revealing nav/footer/grid.
// On subsequent client-nav visits to "/" in the same session, we reveal immediately.
let _introPlayed = false;

export default function HomeIntroGate() {
  useEffect(() => {
    const el = document.documentElement;

    // Attribute is only set by the blocking script when pathname === "/".
    // If it's not present (e.g. user navigated here via client-side nav from another page
    // and the intro already played), there is nothing to gate.
    if (!el.hasAttribute("data-intro-pending")) {
      _introPlayed = true;
      return;
    }

    if (_introPlayed) {
      // Already played this session — remove the gate immediately so
      // returning to "/" via client-nav doesn't re-gate the page.
      el.removeAttribute("data-intro-pending");
      return;
    }

    _introPlayed = true;
    const timer = setTimeout(() => {
      el.removeAttribute("data-intro-pending");
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
