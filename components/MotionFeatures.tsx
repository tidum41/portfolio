"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Site components use `m.*` with the domAnimation feature set (animations,
 * variants, exit, gestures) loaded synchronously, so timing is unchanged but
 * the drag/layout code stays out of the first-load bundle.
 */
export default function MotionFeatures({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
