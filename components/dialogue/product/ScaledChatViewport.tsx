"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";

const DEFAULT_INNER_W = parseInt(dialogueProductTokens.space.placementChatWidth, 10);

type Props = {
  children: ReactNode;
  /** Unscaled layout width (default 392px chat panel). */
  innerWidth?: number;
  /** Lock crop height in inner px; when unset, uses measured content height. */
  cropHeight?: number;
  /** Cap scale (e.g. decision row desktop ~0.58). */
  maxScale?: number;
  /** Bottom fade for equal-height compare crops. */
  fade?: boolean;
  className?: string;
};

/**
 * Renders children at real Dialogue chat width, then scales the whole panel as one unit.
 */
export default function ScaledChatViewport({
  children,
  innerWidth = DEFAULT_INNER_W,
  cropHeight,
  maxScale,
  fade = false,
  className,
}: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.58);
  const [cropH, setCropH] = useState(cropHeight ?? 480);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const inner = innerRef.current;
    if (!layer) return;

    const fit = () => {
      const w = layer.clientWidth;
      if (w < 1) return;
      let s = w / innerWidth;
      if (maxScale !== undefined) s = Math.min(s, maxScale);
      setScale(s);

      if (cropHeight !== undefined) {
        setCropH(cropHeight);
        return;
      }
      const measured = inner?.offsetHeight ?? 0;
      if (measured > 0) setCropH(measured);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(layer);
    if (inner) ro.observe(inner);
    const raf = requestAnimationFrame(fit);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [cropHeight, innerWidth, maxScale]);

  const viewportH = cropH * scale;

  return (
    <div
      ref={layerRef}
      className={["dp-scaled-viewport", className].filter(Boolean).join(" ")}
      style={{ height: viewportH }}
    >
      <div className="dp-scaled-viewport__clip" style={{ height: viewportH }}>
        <div
          ref={innerRef}
          className="dp-scaled-viewport__inner dialogue-product-root dp-chat-panel-typography"
          style={{
            width: innerWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
        {fade ? <div className="dp-scaled-viewport__fade" aria-hidden /> : null}
      </div>
    </div>
  );
}
