"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { afterPaint } from "@/lib/afterPaint";

export type ColumnPhase = "hidden" | "entering" | "in";

/**
 * Keep-alive page show/hide. Outgoing hides immediately (never stacked with
 * the destination — that painted two documents and read as overlap). Incoming
 * plays one CSS fade after paint. `snap` skips the fade (case-study Back).
 * `playMountEnter` false keeps cold Work at rest for the intro.
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
    if (!onRoute) {
      setPhase("hidden");
      return;
    }
    if (phaseRef.current === "in") return;
    setPhase("entering");
    return afterPaint(() => setPhase("in"));
  }, [onRoute, snap, reduced]);

  return phase;
}
