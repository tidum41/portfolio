"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

const DEFAULT_HERO_H = 420;

let sessionVisitedWork = false;

/**
 * Session-long host for the PS3 silk on the work hero. Visible only on "/";
 * hides immediately when leaving work — no route afterimage / linger.
 * Show is derived from pathname (no deferred visible state) so soft-nav
 * returns don't blank the pattern for an extra frame before paint.
 */
export default function PersistentSilkLayer() {
  const pathname = usePathname();
  const onWork = pathname === "/";
  const [hasVisitedWork, setHasVisitedWork] = useState(
    () => sessionVisitedWork || onWork
  );
  const [height, setHeight] = useState(DEFAULT_HERO_H);

  useLayoutEffect(() => {
    if (!onWork) return;
    sessionVisitedWork = true;
    setHasVisitedWork(true);
  }, [onWork]);

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

  if (!hasVisitedWork && !sessionVisitedWork) return null;

  return (
    <div
      aria-hidden
      data-silk-phase={onWork ? "work" : "hidden"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height,
        zIndex: 0,
        opacity: onWork ? 1 : 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <PS3Silk
        mode={1}
        active={onWork}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
