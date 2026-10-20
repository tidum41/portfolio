"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { DialogueCanvasPin, DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import { DIALOGUE_CANVAS_STORAGE_KEY } from "@/lib/caseStudies/dialogueCanvas";

type Props = {
  sections: DialogueCanvasSection[];
};

const IMAGE_WIDTH = 480;
const INITIAL_VIEW = { scale: 0.55, tx: 48, ty: 48 };
const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const DRAG_THRESHOLD_PX = 4;

type View = { scale: number; tx: number; ty: number };

type PendingPin = {
  section: DialogueCanvasSection;
  src: string;
  xPct: number;
  yPct: number;
};

type PointerDrag =
  | {
      kind: "pan";
      pointerId: number;
      startX: number;
      startY: number;
      tx0: number;
      ty0: number;
      moved: boolean;
      captured: boolean;
    }
  | {
      kind: "image";
      pointerId: number;
      startX: number;
      startY: number;
      moved: boolean;
      section: DialogueCanvasSection;
      src: string;
      el: HTMLDivElement;
    };

function fileFromSrc(src: string) {
  return src.split("/").pop() ?? src;
}

function loadPins(): DialogueCanvasPin[] {
  try {
    const raw = localStorage.getItem(DIALOGUE_CANVAS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { pins?: DialogueCanvasPin[] };
    return Array.isArray(parsed.pins) ? parsed.pins : [];
  } catch {
    return [];
  }
}

function savePins(pins: DialogueCanvasPin[]) {
  localStorage.setItem(DIALOGUE_CANVAS_STORAGE_KEY, JSON.stringify({ pins }));
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function movedEnough(startX: number, startY: number, x: number, y: number) {
  return Math.hypot(x - startX, y - startY) >= DRAG_THRESHOLD_PX;
}

const btnStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid var(--color-border-subtle)",
  background: "var(--color-bg-secondary)",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
};

export default function DialogueCanvasClient({ sections }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(INITIAL_VIEW);
  const [view, setView] = useState<View>(INITIAL_VIEW);
  const [pins, setPins] = useState<DialogueCanvasPin[]>([]);
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null);
  const pendingPinRef = useRef<PendingPin | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const dragRef = useRef<PointerDrag | null>(null);
  const pinchRef = useRef<{
    dist: number;
    scale0: number;
    cx: number;
    cy: number;
    view0: View;
  } | null>(null);

  const setViewSynced = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  const zoomAt = useCallback((mx: number, my: number, scaleFactor: number) => {
    const v = viewRef.current;
    const nextScale = clampScale(v.scale * scaleFactor);
    const ratio = nextScale / v.scale;
    setViewSynced({
      scale: nextScale,
      tx: mx - (mx - v.tx) * ratio,
      ty: my - (my - v.ty) * ratio,
    });
  }, [setViewSynced]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    pendingPinRef.current = pendingPin;
  }, [pendingPin]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      if (!drag.moved && movedEnough(drag.startX, drag.startY, e.clientX, e.clientY)) {
        drag.moved = true;
      }

      if (drag.kind === "pan") {
        if (!drag.moved) return;
        const el = viewportRef.current;
        if (!drag.captured && el) {
          el.setPointerCapture(e.pointerId);
          drag.captured = true;
          if (pendingPinRef.current) {
            setPendingPin(null);
            setNoteDraft("");
          }
        }
        setViewSynced({
          ...viewRef.current,
          tx: drag.tx0 + (e.clientX - drag.startX),
          ty: drag.ty0 + (e.clientY - drag.startY),
        });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      if (drag.kind === "pan") {
        if (drag.captured) {
          viewportRef.current?.releasePointerCapture(e.pointerId);
        }
        if (!drag.moved && pendingPinRef.current) {
          setPendingPin(null);
          setNoteDraft("");
        }
      }

      if (drag.kind === "image" && !drag.moved) {
        const rect = drag.el.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;
        setPendingPin({ section: drag.section, src: drag.src, xPct, yPct });
        setNoteDraft("");
      }

      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [setViewSynced]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    setPins(loadPins());

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const footer = document.querySelector("footer");
    const prevFooterDisplay = footer instanceof HTMLElement ? footer.style.display : "";
    if (footer instanceof HTMLElement) footer.style.display = "none";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      if (footer instanceof HTMLElement) footer.style.display = prevFooterDisplay;
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0012;
      const v = viewRef.current;
      const nextScale = clampScale(v.scale * (1 + delta));
      const ratio = nextScale / v.scale;
      setViewSynced({
        scale: nextScale,
        tx: mx - (mx - v.tx) * ratio,
        ty: my - (my - v.ty) * ratio,
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    const dist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      pinchRef.current = { dist: dist(e.touches), scale0: viewRef.current.scale, cx, cy, view0: viewRef.current };
      dragRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const d = dist(e.touches);
      const nextScale = clampScale(pinch.scale0 * (d / pinch.dist));
      const ratio = nextScale / pinch.scale0;
      setViewSynced({
        scale: nextScale,
        tx: pinch.cx - (pinch.cx - pinch.view0.tx) * ratio,
        ty: pinch.cy - (pinch.cy - pinch.view0.ty) * ratio,
      });
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [setViewSynced]);

  const persistPins = useCallback((next: DialogueCanvasPin[]) => {
    setPins(next);
    savePins(next);
  }, []);

  const cancelPending = useCallback(() => {
    setPendingPin(null);
    setNoteDraft("");
  }, []);

  const commitPending = useCallback(() => {
    if (!pendingPin) return;
    const note = noteDraft.trim();
    if (!note) return;
    const id = pins.length > 0 ? Math.max(...pins.map((p) => p.id)) + 1 : 1;
    const pin: DialogueCanvasPin = {
      id,
      sectionId: pendingPin.section.id,
      sectionHeading: pendingPin.section.heading,
      src: pendingPin.src,
      file: fileFromSrc(pendingPin.src),
      xPct: Math.round(pendingPin.xPct * 10) / 10,
      yPct: Math.round(pendingPin.yPct * 10) / 10,
      note,
    };
    persistPins([...pins, pin]);
    cancelPending();
  }, [cancelPending, noteDraft, pendingPin, pins, persistPins]);

  const onViewportPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-canvas-image]") || target.closest("[data-note-input]")) return;

      dragRef.current = {
        kind: "pan",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        tx0: viewRef.current.tx,
        ty0: viewRef.current.ty,
        moved: false,
        captured: false,
      };
    },
    [],
  );

  const onImagePointerDown = useCallback(
    (e: React.PointerEvent, section: DialogueCanvasSection, src: string, el: HTMLDivElement) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      dragRef.current = {
        kind: "image",
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        section,
        src,
        el,
      };
    },
    [],
  );

  const copyFeedback = useCallback(() => {
    const lines = pins.map(
      (p) =>
        `- **${p.sectionHeading}** (\`${p.file}\`) pin ${p.id} @ ${p.xPct}%, ${p.yPct}%: ${p.note}`,
    );
    const md = `# Dialogue canvas feedback\n\n${lines.join("\n")}\n`;
    void navigator.clipboard.writeText(md);
  }, [pins]);

  const resetView = useCallback(() => {
    setViewSynced(INITIAL_VIEW);
    cancelPending();
  }, [cancelPending, setViewSynced]);

  const zoomStep = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      zoomAt(rect.width / 2, rect.height / 2, factor);
    },
    [zoomAt],
  );

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
        background: "var(--color-bg)",
        zIndex: 20,
      }}
    >
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border-subtle)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
        }}
      >
        <strong style={{ fontWeight: 500 }}>Dialogue canvas</strong>
        <span style={{ color: "var(--color-text-muted)" }}>
          Drag background to pan, wheel to zoom, click image to pin
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => zoomStep(1 / 1.12)} style={btnStyle} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => zoomStep(1.12)} style={btnStyle} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={resetView} style={btnStyle}>
            Reset view
          </button>
          <button
            type="button"
            onClick={copyFeedback}
            disabled={pins.length === 0}
            style={{
              ...btnStyle,
              cursor: pins.length ? "pointer" : "not-allowed",
            }}
          >
            Copy feedback ({pins.length})
          </button>
        </div>
      </header>
      <div
        ref={viewportRef}
        onPointerDown={onViewportPointerDown}
        data-canvas-viewport
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          cursor: "grab",
          touchAction: "none",
          background: "#f0efed",
        }}
      >
        <div
          style={{
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
            transformOrigin: "0 0",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 32,
            padding: 24,
            width: "max-content",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                width: IMAGE_WIDTH,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans-medium)",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: "var(--color-text-primary)",
                }}
              >
                {section.heading}
              </p>
              {section.images.map((img) => {
                const imagePins = pins.filter((p) => p.src === img.src);
                const showComposer = pendingPin?.src === img.src;
                return (
                  <div key={img.src} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {img.caption}
                    </p>
                    <div
                      data-canvas-image
                      style={{
                        position: "relative",
                        width: IMAGE_WIDTH,
                        borderRadius: 8,
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                        cursor: "crosshair",
                        background: "#fff",
                      }}
                      onPointerDown={(e) => {
                        onImagePointerDown(e, section, img.src, e.currentTarget);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt=""
                        draggable={false}
                        style={{
                          display: "block",
                          width: IMAGE_WIDTH,
                          height: "auto",
                          objectFit: "contain",
                          verticalAlign: "top",
                        }}
                      />
                      {imagePins.map((pin) => (
                        <span
                          key={pin.id}
                          title={pin.note}
                          style={{
                            position: "absolute",
                            left: `${pin.xPct}%`,
                            top: `${pin.yPct}%`,
                            transform: "translate(-50%, -50%)",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#b03a78",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          {pin.id}
                        </span>
                      ))}
                      {showComposer && pendingPin && (
                        <div
                          data-note-input
                          style={{
                            position: "absolute",
                            left: `${pendingPin.xPct}%`,
                            top: `${pendingPin.yPct}%`,
                            transform: "translate(-50%, -8px)",
                            zIndex: 5,
                            minWidth: 200,
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={noteDraft}
                            autoFocus
                            placeholder="Note… Enter to save"
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitPending();
                              } else if (e.key === "Escape") {
                                e.preventDefault();
                                cancelPending();
                              }
                            }}
                            style={{
                              width: "min(240px, 70vw)",
                              padding: "6px 8px",
                              fontSize: 12,
                              borderRadius: 6,
                              border: "1px solid rgba(0,0,0,0.2)",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
