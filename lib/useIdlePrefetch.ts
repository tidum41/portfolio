"use client";

import { useEffect, useState } from "react";
import { afterIntroIdle } from "@/lib/introReady";

let released = false;
const listeners = new Set<() => void>();
let cancelPending: (() => void) | null = null;

function arm() {
  if (released || cancelPending || typeof window === "undefined") return;
  cancelPending = afterIntroIdle(() => {
    released = true;
    cancelPending = null;
    for (const fn of listeners) fn();
    listeners.clear();
  }, 1500);
}

/**
 * False until the first-load intro has finished and the main thread is idle,
 * then true for the rest of the session. Link prefetch and route warmups wait
 * on this so their RSC payloads don't compete with the page's own JS, posters
 * and fonts on a slow connection. Hover / pointerdown still prefetch at once.
 */
export function useIdlePrefetch(): boolean {
  const [ready, setReady] = useState(released);
  useEffect(() => {
    const fn = () => setReady(true);
    if (released) {
      // Released between render and effect.
      queueMicrotask(fn);
      return;
    }
    listeners.add(fn);
    arm();
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return ready;
}
