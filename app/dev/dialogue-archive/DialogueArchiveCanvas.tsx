"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DialogueArchiveManifest } from "@/lib/caseStudies/dialogueArchiveTypes";
import { DialogueArchiveLivePreviews } from "./DialogueArchiveLivePreviews";

const PAD = 48;
const GAP_X = 28;
const GAP_Y = 56;
const ROW_LABEL_H = 36;
const CAPTION_H = 48;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 2;
const STORAGE_KEY = "dialogue-archive-camera-v1";

type View = { x: number; y: number; z: number };

type Props = {
  manifest: DialogueArchiveManifest;
};

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

function zoomAtPoint(view: View, mx: number, my: number, nextZ: number): View {
  const z = clampZoom(nextZ);
  const ratio = z / view.z;
  return { z, x: mx - (mx - view.x) * ratio, y: my - (my - view.y) * ratio };
}

const captionStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-sans, system-ui)",
  fontSize: 11,
  lineHeight: 1.4,
  color: "var(--color-text-secondary, #5c5650)",
};

const rowTitleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-sans-medium, system-ui)",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "var(--color-text-primary, #1a1816)",
  textTransform: "capitalize",
};

export default function DialogueArchiveCanvas({ manifest }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ x: 48, y: 48, z: 0.35 });
  const [view, setView] = useState<View>({ x: 48, y: 48, z: 0.35 });
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    x0: number;
    y0: number;
    space: boolean;
    captured: boolean;
  } | null>(null);

  const setViewSynced = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const groupOrder = manifest.groups.filter((g) => g.count > 0);

  const layout = useMemo(() => {
    const tiles: {
      kind: "image" | "routes" | "live";
      x: number;
      y: number;
      w: number;
      h: number;
      item?: DialogueArchiveManifest["items"][0];
      label?: string;
    }[] = [];

    let y = PAD;
    let contentW = PAD;
    let contentH = PAD;

    tiles.push({
      kind: "routes",
      x: PAD,
      y,
      w: 900,
      h: 80 + manifest.exportRoutes.length * 18,
      label: "Dev export routes",
    });
    y += 100 + manifest.exportRoutes.length * 18;

    for (const group of groupOrder) {
      const groupItems = manifest.items.filter((i) => i.group === group.id);
      tiles.push({
        kind: "image",
        x: PAD,
        y,
        w: 400,
        h: ROW_LABEL_H,
        label: `${group.label} (${group.count})`,
      });
      y += ROW_LABEL_H + 8;
      let x = PAD;
      let rowH = 0;
      for (const item of groupItems) {
        const w = item.width || 400;
        const h = item.height || 300;
        tiles.push({
          kind: "image",
          x,
          y,
          w,
          h: CAPTION_H + h,
          item,
        });
        rowH = Math.max(rowH, CAPTION_H + h);
        x += w + GAP_X;
        contentW = Math.max(contentW, x);
      }
      y += rowH + GAP_Y;
      contentH = y;
    }

    tiles.push({
      kind: "live",
      x: PAD,
      y,
      w: 4200,
      h: 2400,
      label: `Live components (${manifest.liveComponentCount})`,
    });
    contentH = y + 2500;
    contentW = Math.max(contentW, 4200 + PAD);

    return { tiles, contentW, contentH };
  }, [groupOrder, manifest]);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 40;
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
    setViewSynced({
      x: (rect.width - layout.contentW) / 2,
      y: (rect.height - layout.contentH) / 2,
      z: 1,
    });
  }, [layout.contentH, layout.contentW, setViewSynced]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as View;
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y) && Number.isFinite(parsed.z)) {
          setViewSynced({ ...parsed, z: clampZoom(parsed.z) });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    fitView();
  }, [fitView, setViewSynced]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevOverscroll = document.documentElement.style.overscrollBehaviorX;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overscrollBehaviorX = "none";
    const footer = document.querySelector("footer");
    const prevFooter = footer instanceof HTMLElement ? footer.style.display : "";
    if (footer instanceof HTMLElement) footer.style.display = "none";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.documentElement.style.overscrollBehaviorX = prevOverscroll;
      if (footer instanceof HTMLElement) footer.style.display = prevFooter;
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const delta = -e.deltaY * 0.002;
        setViewSynced(zoomAtPoint(viewRef.current, mx, my, viewRef.current.z * (1 + delta)));
      } else if (!e.shiftKey) {
        e.preventDefault();
        setViewSynced({
          ...viewRef.current,
          x: viewRef.current.x - e.deltaX,
          y: viewRef.current.y - e.deltaY,
        });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewSynced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    const space = e.button === 0 && (e.nativeEvent as PointerEvent).getModifierState?.(" ") === true;
    if (e.button !== 0 && e.button !== 1) return;
    if (e.button === 0 && !space && (e.target as HTMLElement).closest("[data-archive-tile]")) return;
    panRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x0: viewRef.current.x,
      y0: viewRef.current.y,
      space: e.button === 1 || space,
      captured: false,
    };
  }, []);

  const zoomStep = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setViewSynced(
        zoomAtPoint(viewRef.current, rect.width / 2, rect.height / 2, viewRef.current.z * factor),
      );
    },
    [setViewSynced],
  );

  const zoomPct = Math.round(view.z * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--nav-h, 0px)",
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
        onPointerDown={onPointerDown}
        style={{ flex: 1, minHeight: 0, overflow: "hidden", cursor: "default", touchAction: "none" }}
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
          {layout.tiles.map((tile, idx) => {
            if (tile.kind === "routes") {
              return (
                <div key={`routes-${idx}`} style={{ position: "absolute", left: tile.x, top: tile.y, width: tile.w }}>
                  <p style={rowTitleStyle}>Dev export routes</p>
                  <ul style={{ ...captionStyle, margin: "8px 0 0", paddingLeft: 18 }}>
                    {manifest.exportRoutes.map((r) => (
                      <li key={r.path}>
                        <code>{r.path}</code> — {r.note}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (tile.kind === "live") {
              return (
                <div key="live" style={{ position: "absolute", left: tile.x, top: tile.y, width: tile.w }}>
                  <p style={{ ...rowTitleStyle, marginBottom: 16 }}>{tile.label}</p>
                  <DialogueArchiveLivePreviews />
                </div>
              );
            }
            if (tile.label && !tile.item) {
              return (
                <p key={`label-${idx}`} style={{ ...rowTitleStyle, position: "absolute", left: tile.x, top: tile.y }}>
                  {tile.label}
                </p>
              );
            }
            const item = tile.item!;
            return (
              <div
                key={item.id}
                data-archive-tile
                style={{ position: "absolute", left: tile.x, top: tile.y, width: item.width || undefined }}
              >
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(`${item.file} · ${item.shaShort}`)}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "default",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <p style={captionStyle}>
                    <span style={{ fontFamily: "var(--font-mono, ui-monospace)", fontSize: 10 }}>{item.shaShort}</span>
                    {" · "}
                    {item.datePt} PT
                    <br />
                    {item.file}
                  </p>
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.file}
                  width={item.width || undefined}
                  height={item.height || undefined}
                  draggable={false}
                  style={{
                    display: "block",
                    marginTop: 6,
                    width: item.width || "auto",
                    height: item.height || "auto",
                    maxWidth: "none",
                  }}
                />
              </div>
            );
          })}
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
        <button type="button" onClick={() => zoomStep(1 / 1.12)} style={toolBtn}>−</button>
        <input
          type="range"
          min={5}
          max={200}
          value={Math.min(200, Math.max(5, zoomPct))}
          onChange={(e) => {
            const el = viewportRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setViewSynced(
              zoomAtPoint(viewRef.current, rect.width / 2, rect.height / 2, Number(e.target.value) / 100),
            );
          }}
          style={{ width: 140 }}
          aria-label="Zoom"
        />
        <button type="button" onClick={() => zoomStep(1.12)} style={toolBtn}>+</button>
        <span style={{ minWidth: 44, textAlign: "center" }}>{zoomPct}%</span>
        <button type="button" onClick={fitView} style={toolBtn}>Fit all</button>
        <button type="button" onClick={reset100} style={toolBtn}>100%</button>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            fitView();
          }}
          style={toolBtn}
        >
          Reset camera
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
