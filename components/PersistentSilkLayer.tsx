"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { peekInstantBack } from "@/lib/instantNav";
import { EASE_OPACITY, ENTRANCE_DEFAULTS } from "@/lib/motion";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

const EASE = `cubic-bezier(${EASE_OPACITY.join(", ")})`;
const RETURN_MS = Math.round(ENTRANCE_DEFAULTS.duration * 1000);
const DEFAULT_HERO_H = 420;

let sessionVisitedWork = false;

/**
 * Session-long host for the PS3 silk on the work hero. Visible only on "/";
 * hides immediately when leaving work — no route afterimage / linger.
 */
export default function PersistentSilkLayer() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const previousPathRef = useRef(pathname);
  const [hasVisitedWork, setHasVisitedWork] = useState(
    () => sessionVisitedWork || pathname === "/"
  );
  const [visible, setVisible] = useState(pathname === "/");
  const [fadingIn, setFadingIn] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HERO_H);

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

  useLayoutEffect(() => {
    const previousPath = previousPathRef.current;
    if (previousPath === pathname) {
      if (pathname === "/") sessionVisitedWork = true;
      return;
    }
    previousPathRef.current = pathname;

    /* eslint-disable react-hooks/set-state-in-effect -- route visibility before paint */
    if (pathname === "/") {
      sessionVisitedWork = true;
      setHasVisitedWork(true);
      if (peekInstantBack() || reduced) {
        setFadingIn(false);
        setVisible(true);
      } else {
        // Soft fade-in with work return only — never linger on other routes.
        setFadingIn(true);
        setVisible(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
            setFadingIn(false);
          });
        });
      }
    } else {
      setFadingIn(false);
      setVisible(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname, reduced]);

  if (!hasVisitedWork && !sessionVisitedWork) return null;

  const onWork = pathname === "/";
  const show = onWork && visible;
  const duration = fadingIn || (onWork && visible) ? RETURN_MS : 0;

  return (
    <div
      aria-hidden
      data-silk-phase={show ? "work" : "hidden"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height,
        zIndex: 0,
        opacity: show ? 1 : 0,
        pointerEvents: "none",
        overflow: "hidden",
        transition: reduced ? "none" : `opacity ${duration}ms ${EASE}`,
      }}
    >
      <PS3Silk
        mode={1}
        active={show}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
