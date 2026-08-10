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

const PS3Silk = dynamic(() => import("@/components/PS3Silk"));

type Phase = "hidden" | "work" | "returning" | "imprint-hold" | "imprint-yield";

const EASE = `cubic-bezier(${EASE_OPACITY.join(", ")})`;
const RETURN_MS = Math.round(ENTRANCE_DEFAULTS.duration * 1000);
const ABOUT_HOLD_MS = 180;
const ABOUT_YIELD_MS = 650;
const CASE_HOLD_MS = 80;
const CASE_YIELD_MS = 360;

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
  const [hasVisitedWork, setHasVisitedWork] = useState(pathname === "/");
  const [phase, setPhase] = useState<Phase>(pathname === "/" ? "work" : "hidden");
  const [height, setHeight] = useState(420);

  const clearTimers = () => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  };

  const queue = (callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  };

  // Mirror the live work hero box so the persistent layer preserves the same
  // crop before, during, and after the route handoff.
  useLayoutEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-work-hero]");
    if (!hero) return;
    const sync = () => {
      const next = hero.getBoundingClientRect().height;
      if (next >= 2) setHeight(Math.round(next));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
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

    if (pathname === "/") {
      queue(() => setHasVisitedWork(true), 0);
      if (peekInstantBack() || reduced) {
        queue(() => setPhase("work"), 0);
        return;
      }
      queue(() => {
        setPhase("returning");
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase("work")));
      }, 0);
      return;
    }

    if (reduced || (transition !== "work-to-about" && transition !== "work-to-case-study")) {
      queue(() => setPhase("hidden"), 0);
      return;
    }

    queue(() => setPhase("imprint-hold"), 0);
    const [hold, yieldDuration] = transition === "work-to-about"
      ? [ABOUT_HOLD_MS, ABOUT_YIELD_MS]
      : [CASE_HOLD_MS, CASE_YIELD_MS];
    queue(() => setPhase("imprint-yield"), hold);
    queue(() => setPhase("hidden"), hold + yieldDuration);

    return clearTimers;
  }, [pathname, reduced]);

  useEffect(() => clearTimers, []);

  if (!hasVisitedWork) return null;

  const visible = phase !== "hidden";
  const opacity = phase === "hidden" || phase === "returning" || phase === "imprint-yield" ? 0 : 1;
  const duration =
    phase === "returning" || phase === "work"
      ? RETURN_MS
      : phase === "imprint-yield"
        ? pathname === "/about" ? ABOUT_YIELD_MS : CASE_YIELD_MS
        : 0;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: "0 auto auto 0",
        width: "100%",
        height,
        zIndex: 0,
        opacity,
        pointerEvents: "none",
        overflow: "hidden",
        transition: reduced ? "none" : `opacity ${duration}ms ${EASE}`,
        visibility: visible ? "visible" : "hidden",
      }}
    >
      <PS3Silk
        mode={1}
        active={visible}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
