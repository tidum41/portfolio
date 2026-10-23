"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { PLACEMENT_CHAT_WIDTH } from "@/components/dialogue/product/tokens";

const DEFAULT_INNER_W = PLACEMENT_CHAT_WIDTH;

type Props = {
  children: ReactNode;
  /** Unscaled layout width (default 448px chat panel — t384 live width). */
  innerWidth?: number;
  /** Lock crop height in inner px; when unset, uses measured content height. */
  cropHeight?: number;
  /** Cap scale (e.g. decision row desktop ~0.58). */
  maxScale?: number;
  /**
   * Floor. Below this, the panel stays at this scale and the frame crops,
   * instead of shrinking type further.
   */
  minScale?: number;
  /** Cap the visible crop height in outer px. */
  maxOuterHeight?: number;
  /** `reflow` paints children at the frame width with no zoom. */
  fit?: "scale" | "reflow";
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
  minScale,
  maxOuterHeight,
  fit = "scale",
  fade = false,
  className,
}: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [cropH, setCropH] = useState(cropHeight ?? 480);
  const [clipW, setClipW] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [useZoom, setUseZoom] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [reflowH, setReflowH] = useState<number | undefined>(undefined);

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
      if (minScale !== undefined) raw = Math.max(raw, minScale);
      const s = snapScale(raw, innerWidth, dpr);
      setScale(s);

      const scaledW = innerWidth * s;
      const cropping = scaledW > w + 0.5;
      const outerW = cropping ? w : Math.round(scaledW * dpr) / dpr;
      setClipW(outerW);
      setOffsetX(cropping ? 0 : Math.max(0, Math.floor((w - outerW) / 2)));

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
  }, [cropHeight, innerWidth, maxScale, minScale, useZoom, dpr]);

  useLayoutEffect(() => {
    if (fit !== "reflow") return;
    const layer = layerRef.current;
    const inner = innerRef.current;
    if (!layer || !inner) return;

    const measure = () => {
      const measured = inner.offsetHeight;
      if (measured < 1) return;
      let h = measured;
      if (maxOuterHeight !== undefined) h = Math.min(h, maxOuterHeight);
      setReflowH(h);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [fit, maxOuterHeight, children]);

  const shadowSafe = maxOuterHeight === undefined && !fade;

  if (fit === "reflow") {
    const outerH = reflowH;
    return (
      <div
        ref={layerRef}
        className={["dp-scaled-viewport", "dp-scaled-viewport--reflow", className]
          .filter(Boolean)
          .join(" ")}
        data-scale-mode="reflow"
        data-shadow-safe={shadowSafe ? "" : undefined}
        data-scale="1"
        style={outerH !== undefined ? { height: outerH } : undefined}
      >
        <div
          className="dp-scaled-viewport__clip"
          style={outerH !== undefined ? { height: outerH, overflow: "hidden" } : undefined}
        >
          <div
            ref={innerRef}
            className={`dp-scaled-viewport__inner dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
            style={{ width: "100%" }}
          >
            {children}
          </div>
          {fade && outerH !== undefined ? <div className="dp-scaled-viewport__fade" aria-hidden /> : null}
        </div>
      </div>
    );
  }

  const outerW = clipW > 0 ? clipW : Math.round(innerWidth * scale * dpr) / dpr;
  let outerH = Math.round(cropH * scale * dpr) / dpr;
  if (maxOuterHeight !== undefined) outerH = Math.min(outerH, maxOuterHeight);

  return (
    <div
      ref={layerRef}
      className={["dp-scaled-viewport", className].filter(Boolean).join(" ")}
      style={{ height: outerH }}
      data-scale-mode={useZoom ? "zoom" : "transform"}
      data-shadow-safe={shadowSafe ? "" : undefined}
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
