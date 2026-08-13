"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ColumnPhase } from "@/lib/useColumnFocus";

/**
 * Persistent route column. CSS in globals.css (.xmb-column) plays the
 * focus fade; children stay at rest. Keep mounted while hidden.
 */
export default function XmbColumn({
  phase,
  pin = false,
  className,
  style,
  children,
}: {
  phase: ColumnPhase;
  /** Archive is already out of flow — don't absolute-position on leave. */
  pin?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const interactive = phase === "in" || phase === "entering";
  return (
    <div
      className={["xmb-column", className].filter(Boolean).join(" ")}
      data-xmb={phase}
      {...(pin ? { "data-xmb-pin": "" } : {})}
      aria-hidden={!interactive}
      inert={!interactive}
      {...(!interactive ? { "data-nosnippet": true } : {})}
      style={style}
    >
      {children}
    </div>
  );
}
