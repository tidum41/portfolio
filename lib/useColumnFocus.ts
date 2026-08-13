"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { PAGE_FOCUS } from "@/lib/motion";

export type ColumnPhase = "hidden" | "entering" | "in" | "leaving";

/**
 * PS3 column focus for keep-alive shells.
 * Incoming: one CSS fade-up on the wrapper. Outgoing: dim in place, then hide.
 * `snap` (case-study Back) skips both. `playMountEnter` false keeps cold Work
 * at rest so the intro can own first paint.
 */
export function useColumnFocus(
  onRoute: boolean,
  {
    snap = false,
    playMountEnter = true,
  }: {
    snap?: boolean;
    playMountEnter?: boolean;
  } = {},
): ColumnPhase {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [phase, setPhase] = useState<ColumnPhase>(() => {
    if (!onRoute) return "hidden";
    if (snap || reduced || !playMountEnter) return "in";
    return "entering";
  });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useLayoutEffect(() => {
    if (snap || reduced) {
      setPhase(onRoute ? "in" : "hidden");
      return;
    }
    if (onRoute) {
      if (phaseRef.current === "in" || phaseRef.current === "entering") {
        if (phaseRef.current === "entering") {
          const raf = requestAnimationFrame(() => {
            requestAnimationFrame(() => setPhase("in"));
          });
          return () => cancelAnimationFrame(raf);
        }
        return;
      }
      setPhase("entering");
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("in"));
      });
      return () => cancelAnimationFrame(raf);
    }
    if (phaseRef.current === "hidden") return;
    setPhase("leaving");
    const t = window.setTimeout(() => setPhase("hidden"), PAGE_FOCUS.outMs);
    return () => window.clearTimeout(t);
  }, [onRoute, snap, reduced]);

  return phase;
}
