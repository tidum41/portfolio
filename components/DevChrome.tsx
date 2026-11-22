"use client";

import type { ComponentType } from "react";

/**
 * Dev/preview chrome. The require() sits inside a production-dead branch so
 * DialKit's panel, Agentation, and the dev toolbar are absent from the
 * production client bundle. `next dev` and Vercel preview still mount DialKit;
 * the toolbar/Agentation stay local-dev only.
 *
 * NEXT_PUBLIC_DIALKIT is set at build time in next.config.mjs ("1" for
 * `next dev` / Vercel preview, empty for production) so webpack can
 * dead-code-eliminate the DialRoot require — a runtime VERCEL_ENV check
 * cannot, and would ship dialkit/styles.css to production.
 */
const Empty: ComponentType = () => null;

let DevDialRoot: ComponentType = Empty;
let DevToolbar: ComponentType = Empty;

if (process.env.NEXT_PUBLIC_DIALKIT === "1") {
  DevDialRoot = require("@/components/DevDialRoot").default;
}
if (process.env.NODE_ENV === "development") {
  DevToolbar = require("@/components/DevToolbar").default;
}

export function DevDialSlot() {
  if (process.env.NEXT_PUBLIC_DIALKIT !== "1") return null;
  return <DevDialRoot />;
}

export function DevToolbarSlot() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevToolbar />;
}
