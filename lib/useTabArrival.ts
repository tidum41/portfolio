"use client";

import { useRef } from "react";
import { clearPopPending, peekSnapArrival } from "@/lib/instantNav";

/**
 * Latch on a keep-alive shell becoming visible.
 * - snap: case-study Back or browser Back/Forward — content stays at rest.
 * - epoch: bumps on every other arrival so CSS/Framer enter can replay on
 *   the same DOM nodes (finished `.ps3-enter` will not restart otherwise).
 */
export function useTabArrival(visible: boolean): { snap: boolean; epoch: number } {
  const wasVisible = useRef(visible);
  const snapRef = useRef(false);
  const epochRef = useRef(0);

  if (visible && !wasVisible.current) {
    snapRef.current = peekSnapArrival();
    if (!snapRef.current) epochRef.current += 1;
    clearPopPending();
  } else if (!visible) {
    snapRef.current = false;
  }
  wasVisible.current = visible;

  return { snap: snapRef.current, epoch: epochRef.current };
}
