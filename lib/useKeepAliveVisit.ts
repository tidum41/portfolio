"use client";

import { useEffect, useState } from "react";

/**
 * Keep-alive shells stay unmounted until first visit (or a warm hint).
 * Adjust state during render when the route is already current so React
 * retries before paint — a useLayoutEffect latch still returns null for
 * one render, which reads as a dead click.
 */
export function useKeepAliveVisit(
  onRoute: boolean,
  alreadyWarmed: boolean,
  subscribeWarm: (cb: () => void) => () => void,
): boolean {
  const [hasVisited, setHasVisited] = useState(onRoute || alreadyWarmed);
  if (onRoute && !hasVisited) {
    setHasVisited(true);
  }
  useEffect(() => subscribeWarm(() => setHasVisited(true)), [subscribeWarm]);
  return hasVisited;
}
