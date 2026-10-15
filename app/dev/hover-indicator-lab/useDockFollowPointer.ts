"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { computeCursorFollowDockPosition } from "./dockPosition";

const FOLLOW_LERP = 0.62;
const FOLLOW_LERP_REDUCED = 1;

type FollowOpts = {
  enabled: boolean;
  onPosition: (x: number, y: number) => void;
  measure: () => DOMRect | null;
};

export function useDockFollowPointer({ enabled, onPosition, measure }: FollowOpts) {
  const reduced = useReducedMotion();
  const pointerRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const dock = measure();
    if (!dock) {
      rafRef.current = null;
      return;
    }
    const { x: tx, y: ty } = computeCursorFollowDockPosition(
      pointerRef.current.x,
      pointerRef.current.y,
      { width: dock.width, height: dock.height },
    );
    const k = reduced ? FOLLOW_LERP_REDUCED : FOLLOW_LERP;
    const p = posRef.current;
    p.x += (tx - p.x) * k;
    p.y += (ty - p.y) * k;
    onPositionRef.current(Math.round(p.x), Math.round(p.y));
    if (Math.abs(tx - p.x) > 0.4 || Math.abs(ty - p.y) > 0.4) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      p.x = tx;
      p.y = ty;
      onPositionRef.current(tx, ty);
      rafRef.current = null;
    }
  }, [measure, reduced]);

  const setPointer = useCallback(
    (x: number, y: number) => {
      pointerRef.current = { x, y };
      if (!enabled) return;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [enabled, tick],
  );

  const snapPointer = useCallback(
    (x: number, y: number) => {
      pointerRef.current = { x, y };
      const dock = measure();
      if (!dock) return;
      const next = computeCursorFollowDockPosition(x, y, {
        width: dock.width,
        height: dock.height,
      });
      posRef.current = next;
      onPositionRef.current(next.x, next.y);
    },
    [measure],
  );

  useEffect(() => () => stop(), [stop]);

  return { setPointer, snapPointer, stop };
}
