"use client";

import type { ComponentType } from "react";

/**
 * Agentation on preview + local only. The require() sits inside a branch that
 * is dead when NEXT_PUBLIC_VERCEL_ENV === "production", so production client
 * bundles contain no agentation code (verified with a production build grep).
 * Unset locally (next dev) and "preview" / "development" on Vercel all mount.
 */
const Empty: ComponentType = () => null;

let AgentationMount: ComponentType = Empty;

if (process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
  AgentationMount = require("@/components/AgentationMount").default;
}

export default function AgentationSlot() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") return null;
  return <AgentationMount />;
}
