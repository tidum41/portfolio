"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DialogueCanvasPin, DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import { DIALOGUE_CANVAS_STORAGE_KEY } from "@/lib/caseStudies/dialogueCanvas";

type Props = {
  sections: DialogueCanvasSection[];
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

export default function DialogueCanvasClient({ sections }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [tx, setTx] = useState(48);
  const [ty, setTy] = useState(48);
  const [pins, setPins] = useState<DialogueCanvasPin[]>([]);
  const panRef = useRef<{ active: boolean; x: number; y: number; tx0: number; ty0: number } | null>(
    null,
  );
  const pinchRef = useRef<{ dist: number; scale0: number; cx: number; cy: number; tx0: number; ty0: number } | null>(
    null,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    setPins(loadPins());
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

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
      pinchRef.current = { dist: dist(e.touches), scale0: scale, cx, cy, tx0: tx, ty0: ty };
      panRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      const pinch = pinchRef.current;
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const d = dist(e.touches);
      const nextScale = Math.min(2.5, Math.max(0.15, pinch.scale0 * (d / pinch.dist)));
      const ratio = nextScale / pinch.scale0;
      setScale(nextScale);
      setTx(pinch.cx - (pinch.cx - pinch.tx0) * ratio);
      setTy(pinch.cy - (pinch.cy - pinch.ty0) * ratio);
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [scale, tx, ty]);

  const persistPins = useCallback((next: DialogueCanvasPin[]) => {
    setPins(next);
    savePins(next);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.0012;
    const nextScale = Math.min(2.5, Math.max(0.15, scale * (1 + delta)));
    const ratio = nextScale / scale;
    setTx(mx - (mx - tx) * ratio);
    setTy(my - (my - ty) * ratio);
    setScale(nextScale);
  }, [scale, tx, ty]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-canvas-image]")) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      panRef.current = { active: true, x: e.clientX, y: e.clientY, tx0: tx, ty0: ty };
    },
    [tx, ty],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const pan = panRef.current;
    if (!pan?.active) return;
    setTx(pan.tx0 + (e.clientX - pan.x));
    setTy(pan.ty0 + (e.clientY - pan.y));
  }, []);

  const onPointerUp = useCallback(() => {
    if (panRef.current) panRef.current.active = false;
  }, []);

  const addPin = useCallback(
    (
      section: DialogueCanvasSection,
      src: string,
      xPct: number,
      yPct: number,
    ) => {
      const note = window.prompt("Note for this pin:")?.trim();
      if (!note) return;
      const id = pins.length > 0 ? Math.max(...pins.map((p) => p.id)) + 1 : 1;
      const pin: DialogueCanvasPin = {
        id,
        sectionId: section.id,
        sectionHeading: section.heading,
        src,
        file: fileFromSrc(src),
        xPct: Math.round(xPct * 10) / 10,
        yPct: Math.round(yPct * 10) / 10,
        note,
      };
      persistPins([...pins, pin]);
    },
    [pins, persistPins],
  );

  const copyFeedback = useCallback(() => {
    const lines = pins.map(
      (p) =>
        `- **${p.sectionHeading}** (\`${p.file}\`) pin ${p.id} @ ${p.xPct}%, ${p.yPct}%: ${p.note}`,
    );
    const md = `# Dialogue canvas feedback\n\n${lines.join("\n")}\n`;
    void navigator.clipboard.writeText(md);
  }, [pins]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid var(--color-border-subtle)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
        }}
      >
        <strong style={{ fontWeight: 500 }}>Dialogue canvas</strong>
        <span style={{ color: "var(--color-text-muted)" }}>Drag background to pan, wheel to zoom, click image to pin</span>
        <button
          type="button"
          onClick={copyFeedback}
          disabled={pins.length === 0}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-bg-secondary)",
            cursor: pins.length ? "pointer" : "not-allowed",
            fontSize: 13,
          }}
        >
          Copy feedback ({pins.length})
        </button>
      </header>
      <div
        ref={viewportRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          flex: 1,
          overflow: "hidden",
          cursor: "grab",
          touchAction: "none",
          background: "#f0efed",
        }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
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
                width: 300,
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
                        borderRadius: 8,
                        overflow: "hidden",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                        cursor: "crosshair",
                        background: "#fff",
                      }}
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
                        const yPct = ((e.clientY - rect.top) / rect.height) * 100;
                        addPin(section, img.src, xPct, yPct);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt=""
                        draggable={false}
                        style={{ display: "block", width: "100%", height: "auto" }}
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
