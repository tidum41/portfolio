"use client";

import { useCallback, useEffect, useRef } from "react";
import { computeCursorFollowDockPosition } from "./dockPosition";

type FollowOpts = {
  enabled: boolean;
  onPosition: (x: number, y: number) => void;
  measure: () => DOMRect | null;
};

/** Instant cursor-follow positioning (no trail lag). */
export function useDockFollowPointer({ enabled, onPosition, measure }: FollowOpts) {
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;

  const placeAt = useCallback(
    (x: number, y: number) => {
      const dock = measure();
      if (!dock) return;
      const next = computeCursorFollowDockPosition(x, y, {
        width: dock.width,
        height: dock.height,
      });
      onPositionRef.current(next.x, next.y);
    },
    [measure],
  );

  const setPointer = useCallback(
    (x: number, y: number) => {
      if (!enabled) return;
      placeAt(x, y);
    },
    [enabled, placeAt],
  );

  const snapPointer = useCallback(
    (x: number, y: number) => {
      placeAt(x, y);
    },
    [placeAt],
  );

  const stop = useCallback(() => {}, []);

  useEffect(() => () => stop(), [stop]);

  return { setPointer, snapPointer, stop };
}
