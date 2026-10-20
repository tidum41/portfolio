"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ARCHIVE_LAYOUT,
  computeDialogueArchiveLayout,
  computeFitCamera,
} from "@/lib/caseStudies/computeDialogueArchiveLayout";
import type { DialogueArchiveManifest } from "@/lib/caseStudies/dialogueArchiveTypes";
import { DialogueArchiveLivePreviews } from "./DialogueArchiveLivePreviews";

const { CONTENT_PAD, CAPTION_H } = ARCHIVE_LAYOUT;
const MIN_ZOOM = 0.02;
const MAX_ZOOM = 2;
const ROW_LABEL_FONT_PX = 15;
const MIN_LABEL_SCREEN_PX = 12;
const STORAGE_KEY = "dialogue-archive-camera-v2";

type View = { x: number; y: number; z: number };

type Props = {
  manifest: DialogueArchiveManifest;
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
  fontSize: ROW_LABEL_FONT_PX,
  fontWeight: 500,
  letterSpacing: "-0.02em",
  color: "var(--color-text-primary, #1a1816)",
  textTransform: "capitalize",
};

function labelScreenBoost(z: number) {
  const screenPx = ROW_LABEL_FONT_PX * z;
  if (screenPx >= MIN_LABEL_SCREEN_PX) return 1;
  return Math.min(6, MIN_LABEL_SCREEN_PX / Math.max(screenPx, 0.001));
}

export default function DialogueArchiveCanvas({ manifest, initialView }: Props) {
  const layout = useMemo(() => computeDialogueArchiveLayout(manifest), [manifest]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<View>(initialView);
  const [view, setView] = useState<View>(initialView);
  const [cameraReady, setCameraReady] = useState(true);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    x0: number;
    y0: number;
    captured: boolean;
  } | null>(null);

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
      try {
        const next = computeFitCamera({
          viewportW: rect.width,
          viewportH: rect.height,
          bounds: layout.bounds,
          pad: CONTENT_PAD,
        });
        setViewSynced(next);
      } catch (err) {
        console.error("dialogue-archive fitView failed", err);
      }
      setCameraReady(true);
    },
    [layout.bounds, setViewSynced],
  );

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (el) fitFromViewport(el);
  }, [fitFromViewport]);

  const reset100 = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const bw = layout.bounds.maxX - layout.bounds.minX;
    const bh = layout.bounds.maxY - layout.bounds.minY;
    setViewSynced({
      x: (rect.width - bw) / 2 - layout.bounds.minX,
      y: (rect.height - bh) / 2 - layout.bounds.minY,
      z: 1,
    });
  }, [layout.bounds, setViewSynced]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const runFit = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) fitFromViewport(el);
    };

    runFit();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => runFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitFromViewport]);

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
    const hiddenNav: HTMLElement[] = [];
    document.querySelectorAll("header").forEach((el) => {
      if (el instanceof HTMLElement) {
        hiddenNav.push(el);
        el.style.setProperty("display", "none", "important");
      }
    });
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.documentElement.style.overscrollBehaviorX = prevOverscroll;
      if (footer instanceof HTMLElement) footer.style.display = prevFooter;
      hiddenNav.forEach((el) => {
        el.style.display = "";
      });
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
  const labelBoost = labelScreenBoost(view.z);

  const rowLabelProps = (tileId: string) => ({
    "data-archive-bounds": tileId,
    style: {
      ...rowTitleStyle,
      transform: labelBoost > 1 ? `scale(${labelBoost})` : undefined,
      transformOrigin: "top left",
      width: labelBoost > 1 ? `${100 / labelBoost}%` : undefined,
    } as CSSProperties,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        background: "#f0efed",
        zIndex: 200,
      }}
      data-archive-ready={cameraReady ? "true" : "false"}
      data-archive-zoom-pct={zoomPct}
    >
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        data-archive-viewport
        style={{ flex: 1, minHeight: 0, overflow: "hidden", cursor: "default", touchAction: "none" }}
      >
        <div
          data-archive-world
          data-bounds-min-x={layout.bounds.minX}
          data-bounds-min-y={layout.bounds.minY}
          data-bounds-max-x={layout.bounds.maxX}
          data-bounds-max-y={layout.bounds.maxY}
          style={{
            position: "relative",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
            transformOrigin: "0 0",
            width: layout.worldW,
            height: layout.worldH,
          }}
        >
          {layout.tiles.map((tile) => {
            if (tile.kind === "routes") {
              return (
                <div
                  key={tile.id}
                  data-archive-bounds={tile.id}
                  style={{ position: "absolute", left: tile.x, top: tile.y, width: tile.w, height: tile.h }}
                >
                  <p {...rowLabelProps(tile.id)}>Dev export routes</p>
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
            if (tile.kind === "row-label") {
              const labelProps = rowLabelProps(tile.id);
              return (
                <p
                  key={tile.id}
                  data-archive-bounds={tile.id}
                  style={{
                    ...labelProps.style,
                    position: "absolute",
                    left: tile.x,
                    top: tile.y,
                  }}
                >
                  {tile.label}
                </p>
              );
            }
            if (tile.kind === "live") {
              return (
                <div
                  key={tile.id}
                  data-archive-bounds={tile.id}
                  style={{ position: "absolute", left: tile.x, top: tile.y, width: tile.w, height: tile.h }}
                >
                  <DialogueArchiveLivePreviews />
                </div>
              );
            }
            if (tile.kind === "chat-icons" && tile.icon) {
              const icon = tile.icon;
              return (
                <div
                  key={tile.id}
                  data-archive-tile
                  data-archive-bounds={tile.id}
                  data-chat-icon-sha={icon.shaShort}
                  data-world-x={tile.x}
                  data-world-y={tile.y}
                  data-world-w={tile.w}
                  data-world-h={tile.h}
                  style={{
                    position: "absolute",
                    left: tile.x,
                    top: tile.y,
                    width: tile.w,
                    height: tile.h,
                    overflow: "hidden",
                  }}
                >
                  <p style={captionStyle}>
                    <span style={{ fontFamily: "var(--font-mono, ui-monospace)", fontSize: 10 }}>{icon.shaShort}</span>
                    {" · "}
                    {icon.datePt} PT
                    {icon.agreed ? (
                      <>
                        {" · "}
                        <span style={{ fontWeight: 500, color: "var(--color-text-primary, #1a1816)" }}>
                          agreed launcher (68d8212)
                        </span>
                      </>
                    ) : null}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon.src}
                    alt={`Chat launcher at ${icon.shaShort}`}
                    width={icon.width || undefined}
                    height={icon.height || undefined}
                    draggable={false}
                    style={{
                      display: "block",
                      marginTop: 6,
                      width: icon.width || "auto",
                      height: icon.height || "auto",
                      maxWidth: "none",
                    }}
                  />
                </div>
              );
            }
            const item = tile.item!;
            return (
              <div
                key={tile.id}
                data-archive-tile
                data-archive-bounds={tile.id}
                style={{
                  position: "absolute",
                  left: tile.x,
                  top: tile.y,
                  width: tile.w,
                  height: tile.h,
                  overflow: "hidden",
                }}
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
                    objectFit: "contain",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        data-archive-toolbar
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
        <span data-archive-zoom-label style={{ minWidth: 44, textAlign: "center" }}>{zoomPct}%</span>
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
