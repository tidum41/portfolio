"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import {
  peekInstantBack,
  takePatternTransition,
  type PatternTransitionKind,
} from "@/lib/instantNav";
import { EASE_OPACITY, ENTRANCE_DEFAULTS } from "@/lib/motion";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

type Phase = "hidden" | "work" | "returning" | "imprint-hold" | "imprint-yield";

const EASE = `cubic-bezier(${EASE_OPACITY.join(", ")})`;
const RETURN_MS = Math.round(ENTRANCE_DEFAULTS.duration * 1000);
// Work → About: keep the live pattern as an afterimage long enough to read,
// then yield. Sub-200ms holds were effectively invisible in testing.
const ABOUT_HOLD_MS = 1000;
const ABOUT_YIELD_MS = 800;
const CASE_HOLD_MS = 220;
const CASE_YIELD_MS = 420;
const DEFAULT_HERO_H = 420;

/**
 * A single session-long host for the PS3 silk. Its live WebGL scene can leave
 * a brief material afterimage during committed navigation without duplicating
 * a canvas or making route content wait for animation.
 */
export default function PersistentSilkLayer() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const previousPathRef = useRef(pathname);
  const timersRef = useRef<number[]>([]);
  const lastHeroHeightRef = useRef(DEFAULT_HERO_H);
  const [hasVisitedWork, setHasVisitedWork] = useState(pathname === "/");
  const [phase, setPhase] = useState<Phase>(pathname === "/" ? "work" : "hidden");
  const [height, setHeight] = useState(DEFAULT_HERO_H);

  const clearTimers = () => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  };

  const queue = (callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  };

  // Mirror the live work hero box so the persistent layer preserves the same
  // crop before, during, and after the route handoff. Ignore 0-height reads
  // while PersistentWorkShell is display:none.
  useLayoutEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-work-hero]");
    if (!hero) return;
    const sync = () => {
      const next = hero.getBoundingClientRect().height;
      if (next >= 2) {
        const rounded = Math.round(next);
        lastHeroHeightRef.current = rounded;
        setHeight(rounded);
      }
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  // Phase changes must land before paint. Sync setState in useLayoutEffect is
  // intentional here: setTimeout(0)/useEffect left the silk under About for a
  // frame, and the old ~180ms hold ended before the afterimage could be seen.
  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    if (previousPath === pathname) return;
    previousPathRef.current = pathname;
    clearTimers();

    const intent = takePatternTransition(previousPath, pathname);
    const inferred: PatternTransitionKind | null =
      previousPath === "/" && pathname === "/about"
        ? "work-to-about"
        : previousPath === "/about" && pathname === "/"
          ? "about-to-work"
          : previousPath === "/" && pathname !== "/" && pathname !== "/archive"
            ? "work-to-case-study"
            : null;
    const transition = intent ?? inferred;

    /* eslint-disable react-hooks/set-state-in-effect -- silk handoff must commit before paint */
    if (pathname === "/") {
      setHasVisitedWork(true);
      if (peekInstantBack() || reduced) {
        setPhase("work");
      } else {
        // Fade the same live pattern back in with the work return chorus.
        setPhase("returning");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setPhase("work"));
        });
      }
    } else if (reduced || (transition !== "work-to-about" && transition !== "work-to-case-study")) {
      setPhase("hidden");
    } else {
      // Preserve last known hero height for the imprint crop.
      setHeight(lastHeroHeightRef.current);
      setPhase("imprint-hold");
      const [hold, yieldDuration] = transition === "work-to-about"
        ? [ABOUT_HOLD_MS, ABOUT_YIELD_MS]
        : [CASE_HOLD_MS, CASE_YIELD_MS];
      queue(() => setPhase("imprint-yield"), hold);
      queue(() => setPhase("hidden"), hold + yieldDuration);
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    return clearTimers;
  }, [pathname, reduced]);

  useEffect(() => clearTimers, []);

  if (!hasVisitedWork) return null;

  const imprinting = phase === "imprint-hold" || phase === "imprint-yield";
  const visible = phase !== "hidden";
  // Keep the WebGL loop alive through the whole fade-out so the afterimage
  // doesn't collapse to a blank 1×1 canvas mid-transition.
  const canvasActive = visible;
  const opacity =
    phase === "hidden" || phase === "returning" || phase === "imprint-yield"
      ? 0
      : 1;
  const duration =
    phase === "returning" || phase === "work"
      ? RETURN_MS
      : phase === "imprint-yield"
        ? pathname === "/about"
          ? ABOUT_YIELD_MS
          : CASE_YIELD_MS
        : 0;

  return (
    <div
      aria-hidden
      data-silk-phase={phase}
      style={{
        // Fixed during imprint so the afterimage stays in the viewport even if
        // About mounts scrolled or reflows; absolute on Work so it tracks the
        // hero band inside <main>.
        position: imprinting ? "fixed" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height,
        // During imprint, sit above route content (below nav z=40) so the
        // afterimage is actually visible over About. On Work, stay behind the
        // hero text/scrim shell (z=1).
        zIndex: imprinting ? 5 : 0,
        opacity,
        pointerEvents: "none",
        overflow: "hidden",
        transition: reduced ? "none" : `opacity ${duration}ms ${EASE}`,
      }}
    >
      <PS3Silk
        mode={1}
        active={canvasActive}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
