"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useResolvedPrimaryTab } from "@/lib/instantNav";

const PS3Silk = dynamic(() => import("@/components/PS3Silk"), { ssr: false });

// 0 until the hero is measured — a 420px guess then ResizeObserver shrink
// was a visible silk-height jump on first load (hero is ~230–320px).

let sessionVisitedWork = false;

/**
 * Session-long host for the PS3 silk on the work hero. Visible only on the
 * Work tab; hides immediately when leaving work — no route afterimage.
 * Show is derived from the primary-tab store so a Work click paints silk
 * this frame, not after `usePathname` catches up.
 */
export default function PersistentSilkLayer() {
  const pathname = usePathname();
  const onWork = useResolvedPrimaryTab(pathname) === "work";
  const [hasVisitedWork, setHasVisitedWork] = useState(
    () => sessionVisitedWork || onWork
  );
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!onWork) return;
    sessionVisitedWork = true;
    setHasVisitedWork(true);
  }, [onWork]);

  useLayoutEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const attach = () => {
      if (cancelled) return;
      const hero = document.querySelector<HTMLElement>("[data-work-hero]");
      if (!hero) {
        requestAnimationFrame(attach);
        return;
      }
      const sync = () => {
        const next = hero.getBoundingClientRect().height;
        if (next >= 2) setHeight(Math.round(next));
      };
      sync();
      observer = new ResizeObserver(sync);
      observer.observe(hero);
    };
    attach();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [onWork]);

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
        visibility: height >= 2 ? "visible" : "hidden",
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
