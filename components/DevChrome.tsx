"use client";

import type { ComponentType } from "react";

/**
 * Dev-only chrome. The require() sits inside a production-dead branch so
 * DialKit's panel, Agentation, and the dev toolbar are absent from the
 * production client bundle. `next dev` still mounts them.
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
