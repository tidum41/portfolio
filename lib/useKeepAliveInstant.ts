"use client";

import { useRef } from "react";
import { peekKeepAliveSnap } from "@/lib/instantNav";

/**
 * Rising-edge latch: snap keep-alive content only for case-study Back.
 * Primary-nav arrivals stay `false` so the Framer/CSS fade-up can play.
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
