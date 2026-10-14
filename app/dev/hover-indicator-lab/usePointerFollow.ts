"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type FollowOpts = {
  /** 0–1, higher = snappier */
  lerp: number;
  enabled: boolean;
};

export function usePointerFollow({ lerp, enabled }: FollowOpts) {
  const reduced = useReducedMotion();
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const t = targetRef.current;
    const p = posRef.current;
    const k = reduced ? 1 : lerp;
    p.x += (t.x - p.x) * k;
    p.y += (t.y - p.y) * k;
    setPos({ x: p.x, y: p.y });
    if (Math.abs(t.x - p.x) > 0.25 || Math.abs(t.y - p.y) > 0.25) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      p.x = t.x;
      p.y = t.y;
      setPos({ x: p.x, y: p.y });
      rafRef.current = null;
    }
  }, [lerp, reduced]);

  const setTarget = useCallback(
    (x: number, y: number) => {
      targetRef.current = { x, y };
      if (!enabled) return;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [enabled, tick],
  );

  const snapTo = useCallback((x: number, y: number) => {
    targetRef.current = { x, y };
    posRef.current = { x, y };
    setPos({ x, y });
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { pos, setTarget, snapTo, stop };
}
