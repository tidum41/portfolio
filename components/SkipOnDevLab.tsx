"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * `/dev/*` labs (wave, motion, preview) sit under the root layout, which
 * otherwise hydrates keep-alive Work/About/Archive shells, production silk,
 * the custom cursor, nav warmup, and route prefetch — all competing with
 * the lab's own WebGL on first open.
 *
 * Nested `app/dev/layout.tsx` cannot opt out of the root layout. Skip those
 * trees here instead. Do not read `headers()` in the server layout (that
 * would opt the whole site out of static). Exact `/dev` (the editor) still
 * mounts chrome. Work / About / Archive are untouched.
 */
export default function SkipOnDevLab({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dev/")) return null;
  return children;
}
