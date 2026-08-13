"use client";

import { useRef } from "react";
import { peekKeepAliveSnap } from "@/lib/instantNav";

/**
 * Rising-edge latch: first time this keep-alive route is current, snap only
 * if we arrived via primary nav / case-study Back. Later returns always snap.
 * Staying on the route does not flip instant mid-stagger.
 */
export function useKeepAliveInstant(onRoute: boolean): boolean {
  const wasOnRef = useRef(onRoute);
  const snapRef = useRef(onRoute && peekKeepAliveSnap());
  if (onRoute && !wasOnRef.current) {
    snapRef.current = peekKeepAliveSnap();
  }
  wasOnRef.current = onRoute;
  return snapRef.current;
}
