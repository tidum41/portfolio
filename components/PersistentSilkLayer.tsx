"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

const DEFAULT_HERO_H = 420;

let sessionVisitedWork = false;

/**
 * Session-long host for the PS3 silk on the work hero. Visible only on "/";
 * hides immediately when leaving work — no route afterimage / linger.
 */
export default function PersistentSilkLayer() {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const [hasVisitedWork, setHasVisitedWork] = useState(
    () => sessionVisitedWork || pathname === "/"
  );
  const [visible, setVisible] = useState(pathname === "/");
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
      setVisible(true);
    } else {
      setVisible(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  if (!hasVisitedWork && !sessionVisitedWork) return null;

  const show = pathname === "/" && visible;

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
