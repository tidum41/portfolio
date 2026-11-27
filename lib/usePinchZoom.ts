import { useEffect, useRef, type RefObject } from "react";

type Options = {
  enabled: boolean;
  /** Receives the pointers; should have `touch-action: none` where the hook is active. */
  stageRef: RefObject<HTMLElement | null>;
  /** Gets the transform. Its transform-origin should be 0 0. */
  targetRef: RefObject<HTMLElement | null>;
  /** Media query the gestures run under, so desktop keeps its plain fitted image. */
  query: string;
  maxScale?: number;
};

type Point = { x: number; y: number };

/**
 * Pinch to zoom, pan when zoomed, and double tap to toggle 2.5x, for the case-study
 * lightbox on phones. Returns a ref that is true when the last pointer sequence was a
 * gesture, so the caller can ignore the click that follows it.
 */
export function usePinchZoom({ enabled, stageRef, targetRef, query, maxScale = 5 }: Options) {
  const gestured = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const target = targetRef.current;
    if (!enabled || !stage || !target || !window.matchMedia(query).matches) return;

    const pointers = new Map<number, Point>();
    let scale = 1;
    let tx = 0;
    let ty = 0;
    let start: { dist: number; scale: number; mid: Point; tx: number; ty: number } | null = null;
    let pan: { from: Point; tx: number; ty: number } | null = null;
    let lastTap = 0;
    let moved = 0;

    const apply = () => {
      const w = target.offsetWidth;
      const h = target.offsetHeight;
      // The zoomed image always covers its own box, so it never drifts off screen.
      tx = scale === 1 ? 0 : Math.max(w - w * scale, Math.min(0, tx));
      ty = scale === 1 ? 0 : Math.max(h - h * scale, Math.min(0, ty));
      target.style.transform = scale === 1 ? "" : `translate(${tx}px, ${ty}px) scale(${scale})`;
    };

    // Points are measured in the frame, which is never transformed.
    const local = (e: PointerEvent): Point => {
      const r = target.parentElement!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const zoomAt = (next: number, at: Point, from: { scale: number; tx: number; ty: number }) => {
      const s = Math.max(1, Math.min(maxScale, next));
      // Keep the point under the fingers fixed while scaling.
      tx = at.x - ((at.x - from.tx) / from.scale) * s;
      ty = at.y - ((at.y - from.ty) / from.scale) * s;
      scale = s;
      apply();
    };

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, local(e));
      stage.setPointerCapture?.(e.pointerId);
      moved = 0;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        start = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, tx, ty };
        pan = null;
      } else if (pointers.size === 1 && scale > 1) {
        pan = { from: local(e), tx, ty };
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const p = local(e);
      const prev = pointers.get(e.pointerId)!;
      moved += Math.hypot(p.x - prev.x, p.y - prev.y);
      pointers.set(e.pointerId, p);
      if (pointers.size === 2 && start) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt((start.scale * dist) / Math.max(1, start.dist), start.mid, start);
        gestured.current = true;
      } else if (pan) {
        tx = pan.tx + (p.x - pan.from.x);
        ty = pan.ty + (p.y - pan.from.y);
        apply();
        if (moved > 6) gestured.current = true;
      }
    };

    const onUp = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      if (pointers.size < 2) start = null;
      if (pointers.size === 0) pan = null;
      if (p && moved < 6 && pointers.size === 0) {
        const now = performance.now();
        if (now - lastTap < 300) {
          zoomAt(scale > 1 ? 1 : 2.5, p, { scale, tx, ty });
          gestured.current = true;
          lastTap = 0;
        } else {
          lastTap = now;
          // A single tap on the zoomed image shouldn't close the lightbox.
          if (scale > 1) gestured.current = true;
        }
      }
    };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      target.style.transform = "";
    };
  }, [enabled, stageRef, targetRef, query, maxScale]);

  return gestured;
}
