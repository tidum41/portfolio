"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  DIALOGUE_FIGURE_ASPECT,
  DIALOGUE_TRIO_CANONICAL_FRAME,
  type DialogueFigureTier,
} from "@/lib/caseStudies/dialogueFigureTiers";
import { dialogueExportFrame, dialogueExportSrc } from "@/lib/caseStudies/dialogueExportFrames";

type Props = {
  exportRoute: string;
  title: string;
  tier: DialogueFigureTier;
  /** When set, scales every export into this frame (decision trio 1:1). */
  canonicalFrame?: { width: number; height: number };
  assetId?: string;
  className?: string;
};

export default function DialogueLiveFigure({
  exportRoute,
  title,
  tier,
  canonicalFrame,
  assetId,
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const native = dialogueExportFrame(exportRoute);
  const frame = canonicalFrame ?? native;
  const aspect = DIALOGUE_FIGURE_ASPECT[tier];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setMounted(true);
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setContainerWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = containerWidth > 0 ? containerWidth / frame.width : 1;
  const scaledHeight = Math.round(frame.height * scale);

  return (
    <div
      ref={rootRef}
      className={["dialogue-live-figure", `dialogue-live-figure--${tier}`, className]
        .filter(Boolean)
        .join(" ")}
      data-dialogue-asset-id={assetId}
      style={{ aspectRatio: String(aspect), width: "100%" }}
    >
      <div
        className="dialogue-live-figure__viewport"
        style={{ height: containerWidth > 0 ? scaledHeight : undefined }}
      >
        {mounted ? (
          <div
            className="dialogue-live-figure__scale"
            style={{
              width: frame.width,
              height: frame.height,
              transform: `scale(${scale})`,
            }}
          >
            <iframe
              src={dialogueExportSrc(exportRoute)}
              title={title}
              className="dialogue-live-figure__iframe"
              width={frame.width}
              height={frame.height}
              loading="lazy"
              scrolling="no"
              tabIndex={-1}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
