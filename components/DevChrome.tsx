"use client";

import type { ComponentType } from "react";

/**
 * Dev-only chrome (DialKit + ruler dials). The require() sits inside a
 * production-dead NODE_ENV branch so DialKit and the dial toolbar are absent
 * from production and preview client bundles. Agentation lives in
 * AgentationSlot (preview + local via NEXT_PUBLIC_VERCEL_ENV).
 */
const Empty: ComponentType = () => null;

let DevDialRoot: ComponentType = Empty;
let DevToolbar: ComponentType = Empty;

if (process.env.NODE_ENV === "development") {
  DevDialRoot = require("@/components/DevDialRoot").default;
  DevToolbar = require("@/components/DevToolbar").default;
}

export function DevDialSlot() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevDialRoot />;
}

export function DevToolbarSlot() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevToolbar />;
}
