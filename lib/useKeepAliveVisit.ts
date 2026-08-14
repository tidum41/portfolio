"use client";

import { useState } from "react";

/**
 * Mount a keep-alive shell on first visit. setState during render so React
 * retries before paint — a useEffect latch returns null for one frame.
 */
export function useKeepAliveVisit(onRoute: boolean): boolean {
  const [hasVisited, setHasVisited] = useState(onRoute);
  if (onRoute && !hasVisited) {
    setHasVisited(true);
  }
  return hasVisited;
}
