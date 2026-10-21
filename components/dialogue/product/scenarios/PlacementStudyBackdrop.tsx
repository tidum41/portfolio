"use client";

import { useLayoutEffect, useRef, useState } from "react";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";

const SHELL_W = 1280;
const SHELL_H = 748;

/** Full study shell scaled to fit the placement figure frame (contain, no crop). */
export default function PlacementStudyBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useLayoutEffect(() => {
    const layer = backdropRef.current?.closest(".dp-placement-layer");
    if (!layer) return;

    const fit = () => {
      const w = layer.clientWidth;
      const h = layer.clientHeight;
      if (w < 1 || h < 1) return;
      setScale(Math.min(w / SHELL_W, h / SHELL_H));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(layer);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={backdropRef} className="dp-placement-backdrop" aria-hidden>
      <div
        className="dp-placement-backdrop__scale"
        style={{
          width: SHELL_W,
          height: SHELL_H,
          transform: `scale(${scale})`,
        }}
      >
        <StudyPageChrome />
      </div>
    </div>
  );
}
