"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  REVIEW_LAYOUT,
  REVIEW_TOOLBAR_H,
  computeDialogueReviewLayout,
  computeReviewFitCamera,
  rowLabelScreenPx,
  rowLabelToTileScreenGap,
} from "@/lib/caseStudies/computeDialogueReviewLayout";
import type { DialogueReviewManifest, ReviewTileStatus } from "@/lib/caseStudies/dialogueReviewTypes";

const ARCHIVE_AREAL = '"ABC Areal Archive", "Helvetica Neue", Helvetica, Arial, sans-serif';

const { CONTENT_PAD, CAPTION_GAP, CAPTION_BLOCK_H } = REVIEW_LAYOUT;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2;
const STORAGE_KEY = "dialogue-review-camera-v1";
const ACCENT = "#2563eb";

type View = { x: number; y: number; z: number };
type StatusFilter = "all" | ReviewTileStatus;

type Props = {
  manifest: DialogueReviewManifest;
  initialView: View;
};

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

function zoomAtPoint(view: View, mx: number, my: number, nextZ: number): View {
  const z = clampZoom(nextZ);
  const ratio = z / view.z;
  return { z, x: mx - (mx - view.x) * ratio, y: my - (my - view.y) * ratio };
}

function captionStyle(z: number): CSSProperties {
  return {
    margin: 0,
    marginBottom: CAPTION_GAP / z,
    fontFamily: ARCHIVE_AREAL,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.35,
    color: "#5c5650",
    height: CAPTION_BLOCK_H,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
}

function screenLabelStyle(z: number): CSSProperties {
  const hidden = rowLabelToTileScreenGap(z) < 8;
  return {
    margin: 0,
    fontFamily: ARCHIVE_AREAL,
    fontSize: hidden ? 0 : rowLabelScreenPx(z),
    fontWeight: 500,
    letterSpacing: "-0.02em",
    color: "#1a1816",
    lineHeight: 1.15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    opacity: hidden ? 0 : 1,
    pointerEvents: "none",
  };
}

export default function DialogueReviewCanvas({ manifest, initialView }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const filteredManifest = useMemo(() => {
    if (statusFilter === "all") return manifest;
    return {
      ...manifest,
      tiles: manifest.tiles.filter((t) => t.status === statusFilter),
    };
  }, [manifest, statusFilter]);

  const layout = useMemo(() => computeDialogueReviewLayout(filteredManifest), [filteredManifest]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<View>(initialView);
  const [view, setView] = useState<View>(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const screenLabels = useMemo(() => {
    const labels: { id: string; x: number; y: number; text: string }[] = [];
    for (const lt of layout.tiles) {
      if (lt.kind === "row-label" && lt.label) {
        labels.push({ id: lt.id, x: lt.x, y: lt.y, text: lt.label });
      }
    }
    return labels;
  }, [layout.tiles]);

  const setViewSynced = useCallback((next: View) => {
    const clamped = { ...next, z: clampZoom(next.z) };
    viewRef.current = clamped;
    setView(clamped);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  const fitFromViewport = useCallback(
    (el: HTMLDivElement) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      setViewSynced(
        computeReviewFitCamera({
          viewportW: rect.width,
          viewportH: rect.height,
          bounds: layout.fitBounds,
          pad: CONTENT_PAD,
        }),
      );
    },
    [layout.fitBounds, setViewSynced],
  );

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (el) fitFromViewport(el);
  }, [fitFromViewport]);

  const reset100 = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const b = layout.fitBounds;
    const bw = b.maxX - b.minX;
    setViewSynced({
      x: (rect.width - bw) / 2 - b.minX,
      y: CONTENT_PAD - b.minY,
      z: 1,
    });
  }, [layout.fitBounds, setViewSynced]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const run = () => fitFromViewport(el);
    run();
    const ro = new ResizeObserver(() => run());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitFromViewport]);

  useEffect(() => {
    const api = {
      setZoom: (z: number) => {
        const el = viewportRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setViewSynced(zoomAtPoint(viewRef.current, rect.width / 2, rect.height / 2, z));
      },
      reset100,
      fit: fitView,
    };
    (window as unknown as { __dialogueReviewCamera?: typeof api }).__dialogueReviewCamera = api;
    return () => {
      delete (window as unknown as { __dialogueReviewCamera?: typeof api }).__dialogueReviewCamera;
    };
  }, [fitView, reset100, setViewSynced]);

  useEffect(() => {
    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) {
        setSelectedId(null);
        return;
      }
      if (manifest.tiles.some((t) => t.id === id)) setSelectedId(id);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [manifest.tiles]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setViewSynced(zoomAtPoint(viewRef.current, mx, my, viewRef.current.z * (1 - e.deltaY * 0.002)));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewSynced]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const footer = document.querySelector("footer");
    const prevFooter = footer instanceof HTMLElement ? footer.style.display : "";
    if (footer instanceof HTMLElement) footer.style.display = "none";
    document.querySelectorAll("header").forEach((el) => {
      if (el instanceof HTMLElement) el.style.setProperty("display", "none", "important");
    });
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      if (footer instanceof HTMLElement) footer.style.display = prevFooter;
    };
  }, []);

  const selectTile = useCallback((id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    void navigator.clipboard?.writeText(id);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  }, []);

  const zoomPct = Math.round(view.z * 100);

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#f0efed", zIndex: 200 }}>
      <div
        ref={viewportRef}
        data-review-viewport
        style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative", touchAction: "none" }}
        onPointerDown={(e) => {
          if (e.button !== 0 && e.button !== 1) return;
          const pan = { startX: e.clientX, startY: e.clientY, x0: viewRef.current.x, y0: viewRef.current.y, id: e.pointerId };
          const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pan.id) return;
            setViewSynced({
              ...viewRef.current,
              x: pan.x0 + (ev.clientX - pan.startX),
              y: pan.y0 + (ev.clientY - pan.startY),
            });
          };
          const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pan.id) return;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      >
        <div
          style={{
            position: "absolute",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
            transformOrigin: "0 0",
            width: layout.worldW,
            height: layout.worldH,
          }}
        >
          {layout.tiles.map((lt) => {
            if (lt.kind === "row-label") return null;
            const tile = lt.tile;
            const selected = selectedId === tile.id;
            const dimmed = false;
            const caption = `${tile.id} · ${tile.file} · ${tile.shaShort} · ${tile.datePt} PT · ${tile.status}`;
            return (
              <button
                key={lt.id}
                type="button"
                data-review-tile
                data-tile-id={tile.id}
                data-archive-tile
                onClick={() => selectTile(tile.id)}
                style={{
                  position: "absolute",
                  left: lt.x,
                  top: lt.y,
                  width: lt.w,
                  height: lt.h,
                  padding: 0,
                  border: selected ? `2px solid ${ACCENT}` : "2px solid transparent",
                  borderRadius: 4,
                  background: "transparent",
                  cursor: "default",
                  opacity: dimmed ? 0.45 : 1,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  textAlign: "left",
                }}
              >
                <span data-archive-caption data-review-status={tile.status} style={captionStyle(view.z)} title={caption}>
                  {caption}
                </span>
                <span data-archive-tile-media>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt={tile.file}
                  width={tile.width}
                  height={tile.height}
                  draggable={false}
                  style={{ display: "block", width: tile.width || "auto", height: tile.height || "auto", maxWidth: "none" }}
                />
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          {screenLabels.map((label) => (
            <p
              key={label.id}
              data-archive-screen-label
              style={{
                ...screenLabelStyle(view.z),
                position: "absolute",
                left: view.x + label.x * view.z,
                top: view.y + label.y * view.z,
              }}
            >
              {label.text}
            </p>
          ))}
        </div>
      </div>

      <div
        data-archive-toolbar
        style={{
          flexShrink: 0,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px 14px",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.94)",
          fontFamily: ARCHIVE_AREAL,
          fontSize: 13,
        }}
      >
        {(["all", "final", "candidate"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid rgba(0,0,0,0.15)",
              background: statusFilter === f ? "#1a1816" : "#fff",
              color: statusFilter === f ? "#fff" : "#1a1816",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {f === "all" ? "All" : f === "final" ? "Final" : "Candidate"}
          </button>
        ))}
        <button type="button" onClick={() => setViewSynced(zoomAtPoint(viewRef.current, 400, 300, viewRef.current.z * 1.12))}>+</button>
        <button type="button" onClick={() => setViewSynced(zoomAtPoint(viewRef.current, 400, 300, viewRef.current.z / 1.12))}>−</button>
        <span data-archive-zoom-label>{zoomPct}%</span>
        <button type="button" onClick={fitView}>Fit all</button>
        <button type="button" onClick={reset100}>100%</button>
        {copiedId ? <span style={{ color: ACCENT, fontWeight: 500 }}>Copied {copiedId}</span> : null}
      </div>
    </div>
  );
}
