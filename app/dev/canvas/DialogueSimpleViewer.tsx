"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import dialogueCanvasSizes from "@/lib/caseStudies/dialogueCanvasSizes.json";
import {
  DIALOGUE_CANVAS_DISPLAY_WIDTH,
  type DialogueImageSize,
  scaledDisplaySize,
} from "@/lib/caseStudies/dialogueCanvasImageMeta";

const sizes = dialogueCanvasSizes as Record<string, DialogueImageSize>;

const IMAGE_W = DIALOGUE_CANVAS_DISPLAY_WIDTH;
const COLUMN_GAP = 80;
const ROW_GAP = 80;
const PAD = 24;
const TEXT_BLOCK_H = 76;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;

type View = { x: number; y: number; z: number };

type Props = {
  sections: DialogueCanvasSection[];
};

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

function zoomAtPoint(view: View, mx: number, my: number, nextZ: number): View {
  const z = clampZoom(nextZ);
  const ratio = z / view.z;
  return {
    z,
    x: mx - (mx - view.x) * ratio,
    y: my - (my - view.y) * ratio,
  };
}

export default function DialogueSimpleViewer({ sections }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ x: 48, y: 48, z: 0.55 });
  const [view, setView] = useState<View>({ x: 48, y: 48, z: 0.55 });
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    x0: number;
    y0: number;
    captured: boolean;
  } | null>(null);

  const setViewSynced = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const layout = useMemo(() => {
    let colX = PAD;
    let maxBottom = 0;
    const columns = sections.map((section) => {
      const x = colX;
      let y = PAD;
      const items = section.images.map((img) => {
        const natural = sizes[img.src];
        const display = natural ? scaledDisplaySize(natural) : { w: IMAGE_W, h: 400 };
        const textY = y;
        y += TEXT_BLOCK_H + ROW_GAP;
        const imageY = y;
        y += display.h + ROW_GAP;
        return { img, display, textY, imageY };
      });
      const columnH = y;
      maxBottom = Math.max(maxBottom, y);
      colX += IMAGE_W + COLUMN_GAP;
      return { section, x, columnH, items };
    });
    return { columns, contentW: colX - COLUMN_GAP + PAD, contentH: maxBottom + PAD };
  }, [sections]);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 32;
    const scale = clampZoom(
      Math.min((rect.width - pad * 2) / layout.contentW, (rect.height - pad * 2) / layout.contentH),
    );
    const x = (rect.width - layout.contentW * scale) / 2;
    const y = (rect.height - layout.contentH * scale) / 2;
    setViewSynced({ x, y, z: scale });
  }, [layout.contentH, layout.contentW, setViewSynced]);

  const reset100 = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.width - layout.contentW) / 2;
    const y = (rect.height - layout.contentH) / 2;
    setViewSynced({ x, y, z: 1 });
  }, [layout.contentH, layout.contentW, setViewSynced]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const footer = document.querySelector("footer");
    const prevFooter = footer instanceof HTMLElement ? footer.style.display : "";
    if (footer instanceof HTMLElement) footer.style.display = "none";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      if (footer instanceof HTMLElement) footer.style.display = prevFooter;
    };
  }, []);

  useEffect(() => {
    fitView();
  }, [fitView]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const v = viewRef.current;

      if (e.ctrlKey || e.metaKey) {
        const delta = -e.deltaY * 0.002;
        setViewSynced(zoomAtPoint(v, mx, my, v.z * (1 + delta)));
      } else {
        setViewSynced({
          ...v,
          x: v.x - e.deltaX,
          y: v.y - e.deltaY,
        });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewSynced]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const pan = panRef.current;
      if (!pan || pan.pointerId !== e.pointerId) return;
      const el = viewportRef.current;
      if (!pan.captured && el) {
        el.setPointerCapture(e.pointerId);
        pan.captured = true;
      }
      setViewSynced({
        ...viewRef.current,
        x: pan.x0 + (e.clientX - pan.startX),
        y: pan.y0 + (e.clientY - pan.startY),
      });
    };
    const onUp = (e: PointerEvent) => {
      const pan = panRef.current;
      if (!pan || pan.pointerId !== e.pointerId) return;
      if (pan.captured) viewportRef.current?.releasePointerCapture(e.pointerId);
      panRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setViewSynced]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    panRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x0: viewRef.current.x,
      y0: viewRef.current.y,
      captured: false,
    };
  }, []);

  const zoomStep = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = rect.width / 2;
      const my = rect.height / 2;
      setViewSynced(zoomAtPoint(viewRef.current, mx, my, viewRef.current.z * factor));
    },
    [setViewSynced],
  );

  const onSlider = useCallback(
    (pct: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = rect.width / 2;
      const my = rect.height / 2;
      setViewSynced(zoomAtPoint(viewRef.current, mx, my, pct / 100));
    },
    [setViewSynced],
  );

  const zoomPct = Math.round(view.z * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--nav-h)",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "#f0efed",
        zIndex: 25,
      }}
    >
      <div
        ref={viewportRef}
        data-canvas-viewport
        onPointerDown={onPointerDown}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
            transformOrigin: "0 0",
            width: layout.contentW,
            height: layout.contentH,
          }}
        >
          {layout.columns.map(({ section, x, columnH, items }) => (
            <div
              key={section.id}
              style={{
                position: "absolute",
                left: x,
                top: 0,
                width: IMAGE_W,
                height: columnH,
              }}
            >
              {items.map(({ img, display, textY, imageY }) => (
                <div key={img.src}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: textY,
                      width: IMAGE_W,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-sans-medium, system-ui)",
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1.3,
                        color: "var(--color-text-primary, #111)",
                      }}
                    >
                      {section.heading}
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: "var(--color-text-muted, #666)",
                      }}
                    >
                      {img.caption}
                    </p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.caption}
                    width={IMAGE_W}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: imageY,
                      width: IMAGE_W,
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "10px 16px 14px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.94)",
          fontFamily: "var(--font-sans, system-ui)",
          fontSize: 13,
        }}
      >
        <button type="button" onClick={() => zoomStep(1 / 1.12)} style={toolBtn}>
          −
        </button>
        <input
          type="range"
          min={10}
          max={200}
          value={Math.min(200, Math.max(10, zoomPct))}
          onChange={(e) => onSlider(Number(e.target.value))}
          style={{ width: 140 }}
          aria-label="Zoom"
        />
        <button type="button" onClick={() => zoomStep(1.12)} style={toolBtn}>
          +
        </button>
        <span style={{ minWidth: 44, textAlign: "center" }}>{zoomPct}%</span>
        <button type="button" onClick={fitView} style={toolBtn}>
          Fit
        </button>
        <button type="button" onClick={reset100} style={toolBtn}>
          100%
        </button>
      </div>
    </div>
  );
}

const toolBtn: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
};
