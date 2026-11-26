"use client";

import { useEffect, useRef, type RefObject } from "react";

// Pinch / double-tap / wheel zoom + pan for one image inside a full-screen stage.
// Writes `transform` straight to the pan element (no React state per frame).
// Scale 1 = image "contained" in the stage; pan is clamped so the image never
// leaves the stage once zoomed.

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 5;
export const ZOOM_DOUBLE_TAP = 2.5;
const TAP_SLOP = 10; // px a pointer may drift and still count as a tap
const DOUBLE_TAP_MS = 320;

type Pt = { x: number; y: number };

type Options = {
  stageRef: RefObject<HTMLElement | null>;
  panRef: RefObject<HTMLElement | null>;
  imgRef: RefObject<HTMLImageElement | null>;
  /** Single tap outside the image (scale 1). */
  onTapOutside: () => void;
};

export function usePinchZoom({ stageRef, panRef, imgRef, onTapOutside }: Options) {
  const tapOutside = useRef(onTapOutside);
  useEffect(() => {
    tapOutside.current = onTapOutside;
  });

  useEffect(() => {
    const stage = stageRef.current;
    const pan = panRef.current;
    if (!stage || !pan) return;

    let s = 1;
    let tx = 0;
    let ty = 0;
    const pointers = new Map<number, Pt>();
    let pinch: { d0: number; s0: number; q: Pt } | null = null; // q = image-space point under the pinch midpoint
    let tapStart: { x: number; y: number; t: number; id: number } | null = null;
    let lastTap: { x: number; y: number; t: number } | null = null;
    let moved = false;

    // Stage content box (padding removed) and the rendered image rect inside it at scale 1.
    const geometry = () => {
      const r = pan.getBoundingClientRect();
      // pan is transformed; read untransformed size from layout instead.
      const w = pan.offsetWidth;
      const h = pan.offsetHeight;
      const img = imgRef.current;
      const nw = img?.naturalWidth || w;
      const nh = img?.naturalHeight || h;
      const fit = Math.min(w / nw, h / nh);
      return { w, h, cw: nw * fit, ch: nh * fit, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const clamp = () => {
      const g = geometry();
      const maxX = Math.max(0, (g.cw * s - g.w) / 2);
      const maxY = Math.max(0, (g.ch * s - g.h) / 2);
      tx = Math.min(maxX, Math.max(-maxX, tx));
      ty = Math.min(maxY, Math.max(-maxY, ty));
      if (s === 1) { tx = 0; ty = 0; }
    };

    const apply = (animate: boolean) => {
      clamp();
      pan.dataset.animate = animate ? "true" : "false";
      pan.dataset.zoomed = s > 1.001 ? "true" : "false";
      pan.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    };

    // Zoom to `ns` keeping the image point under (px, py) fixed on screen.
    const zoomAt = (ns: number, px: number, py: number, animate: boolean) => {
      const g = geometry();
      // pan centre on screen at scale 1 = stage-content centre; current centre = that + t.
      const baseX = g.cx - tx;
      const baseY = g.cy - ty;
      const qx = (px - baseX - tx) / s;
      const qy = (py - baseY - ty) / s;
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, ns));
      tx = px - baseX - next * qx;
      ty = py - baseY - next * qy;
      s = next;
      apply(animate);
    };

    const hitsImage = (px: number, py: number) => {
      const g = geometry();
      const dx = Math.abs(px - g.cx);
      const dy = Math.abs(py - g.cy);
      return dx <= (g.cw * s) / 2 && dy <= (g.ch * s) / 2;
    };

    const dist = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const mid = (): Pt => {
      const [a, b] = [...pointers.values()];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { stage.setPointerCapture(e.pointerId); } catch { /* synthetic or already-ended pointer */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) {
        tapStart = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
        moved = false;
      } else {
        tapStart = null;
        if (pointers.size === 2) {
          const m = mid();
          const g = geometry();
          pinch = {
            d0: dist() || 1,
            s0: s,
            q: { x: (m.x - (g.cx - tx) - tx) / s, y: (m.y - (g.cy - ty) - ty) / s },
          };
        }
      }
    };

    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > TAP_SLOP) moved = true;
      if (pointers.size >= 2 && pinch) {
        const m = mid();
        const g = geometry();
        const ns = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (pinch.s0 * dist()) / pinch.d0));
        const baseX = g.cx - tx;
        const baseY = g.cy - ty;
        s = ns;
        tx = m.x - baseX - ns * pinch.q.x;
        ty = m.y - baseY - ns * pinch.q.y;
        apply(false);
      } else if (pointers.size === 1 && s > 1 && moved) {
        tx += e.clientX - prev.x;
        ty += e.clientY - prev.y;
        apply(false);
      }
    };

    const up = (e: PointerEvent) => {
      const had = pointers.delete(e.pointerId);
      try { stage.releasePointerCapture(e.pointerId); } catch { /* not captured */ }
      if (!had) return;
      if (pointers.size < 2) pinch = null;
      if (s < 1.02) { s = 1; apply(true); }
      if (pointers.size === 0 && tapStart && !moved && e.pointerId === tapStart.id) {
        const now = performance.now();
        const onImg = hitsImage(e.clientX, e.clientY);
        if (lastTap && now - lastTap.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30 && onImg) {
          zoomAt(s > 1.05 ? 1 : ZOOM_DOUBLE_TAP, e.clientX, e.clientY, true);
          lastTap = null;
        } else {
          lastTap = { x: e.clientX, y: e.clientY, t: now };
          if (!onImg && s === 1) tapOutside.current();
        }
      }
      if (pointers.size === 1) {
        // one finger lifted from a pinch: continue as a pan without a jump
        tapStart = null;
        moved = true;
      }
    };

    const cancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
    };

    // Trackpad pinch arrives as ctrl+wheel; plain wheel pans while zoomed.
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        zoomAt(s * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY, false);
      } else if (s > 1) {
        e.preventDefault();
        tx -= e.deltaX;
        ty -= e.deltaY;
        apply(false);
      }
    };

    const key = (e: KeyboardEvent) => {
      const g = geometry();
      if (e.key === "+" || e.key === "=") zoomAt(s * 1.5, g.cx, g.cy, true);
      else if (e.key === "-" || e.key === "_") zoomAt(s / 1.5, g.cx, g.cy, true);
      else if (e.key === "0") zoomAt(1, g.cx, g.cy, true);
      else if (s > 1 && e.key.startsWith("Arrow")) {
        const step = 60;
        if (e.key === "ArrowLeft") tx += step;
        if (e.key === "ArrowRight") tx -= step;
        if (e.key === "ArrowUp") ty += step;
        if (e.key === "ArrowDown") ty -= step;
        apply(true);
        e.preventDefault();
      }
    };

    const reflow = () => apply(false);

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", cancel);
    stage.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("keydown", key);
    window.addEventListener("resize", reflow);
    apply(false);
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", cancel);
      stage.removeEventListener("wheel", wheel);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", reflow);
    };
  }, [stageRef, panRef, imgRef]);
}
