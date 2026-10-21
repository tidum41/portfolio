"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueProductTokens } from "@/components/dialogue/product/tokens";

const DEFAULT_INNER_W = parseInt(dialogueProductTokens.space.placementChatWidth, 10);

type Props = {
  children: ReactNode;
  /** Unscaled layout width (default 448px chat panel — t384 live width). */
  innerWidth?: number;
  /** Lock crop height in inner px; when unset, uses measured content height. */
  cropHeight?: number;
  /** Cap scale (e.g. decision row desktop ~0.58). */
  maxScale?: number;
  /** Bottom fade for equal-height compare crops. */
  fade?: boolean;
  className?: string;
};

function supportsCssZoom() {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
  return CSS.supports("zoom", "0.5");
}

/** Snap scale so outer size lands on whole device pixels (fixes glyph gaps). */
function snapScale(raw: number, innerWidth: number, dpr: number) {
  if (raw >= 0.999) return 1;
  const outerCss = raw * innerWidth;
  const outerDevice = Math.max(1, Math.round(outerCss * dpr));
  // Prefer neat 1/16 CSS zoom steps when close — cleaner than arbitrary fractions.
  const neat = Math.round((outerDevice / (innerWidth * dpr)) * 16) / 16;
  const neatDevice = Math.round(neat * innerWidth * dpr);
  if (Math.abs(neatDevice - outerDevice) <= 1) {
    return neatDevice / (innerWidth * dpr);
  }
  return outerDevice / (innerWidth * dpr);
}

/**
 * Renders children at real Dialogue chat width, then scales the whole panel as one unit.
 * Prefers CSS `zoom` (avoids many transform text bugs). Snaps to device pixels and
 * zeros letter-spacing under scale so glyphs don't open gaps at fractional scales.
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
  const [scale, setScale] = useState(0.5);
  const [cropH, setCropH] = useState(cropHeight ?? 480);
  const [offsetX, setOffsetX] = useState(0);
  const [useZoom, setUseZoom] = useState(false);
  const [dpr, setDpr] = useState(1);

  useLayoutEffect(() => {
    setUseZoom(supportsCssZoom());
    setDpr(window.devicePixelRatio || 1);
    const onChange = () => setDpr(window.devicePixelRatio || 1);
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener?.("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      mq.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const inner = innerRef.current;
    if (!layer) return;

    const fit = () => {
      const w = layer.clientWidth;
      if (w < 1) return;

      let raw = w / innerWidth;
      if (maxScale !== undefined) raw = Math.min(raw, maxScale);
      const s = snapScale(raw, innerWidth, dpr);
      setScale(s);

      const outerW = Math.round(innerWidth * s * dpr) / dpr;
      setOffsetX(Math.max(0, Math.floor((w - outerW) / 2)));

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
  }, [cropHeight, innerWidth, maxScale, useZoom, dpr]);

  const outerW = Math.round(innerWidth * scale * dpr) / dpr;
  const outerH = Math.round(cropH * scale * dpr) / dpr;

  return (
    <div
      ref={layerRef}
      className={["dp-scaled-viewport", className].filter(Boolean).join(" ")}
      style={{ height: outerH }}
      data-scale-mode={useZoom ? "zoom" : "transform"}
      data-scale={String(scale)}
    >
      <div
        className="dp-scaled-viewport__clip"
        style={{
          height: outerH,
          width: outerW,
          marginLeft: offsetX,
        }}
      >
        {/*
          Scale wrapper is sized to the integer device-pixel outer box.
          Inner paints at native 448px type metrics, then zoom/scale as one unit.
        */}
        <div
          ref={innerRef}
          className={`dp-scaled-viewport__inner dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
          style={
            scale >= 0.999
              ? { width: innerWidth }
              : useZoom
                ? {
                    width: innerWidth,
                    zoom: scale,
                  }
                : {
                    width: innerWidth,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }
          }
        >
          {children}
        </div>
        {fade ? <div className="dp-scaled-viewport__fade" aria-hidden /> : null}
      </div>
    </div>
  );
}
