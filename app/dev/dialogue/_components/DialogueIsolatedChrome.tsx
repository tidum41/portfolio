"use client";

import type { ReactNode } from "react";
import { dialogueMono, dialogueSans } from "../dialogue-fonts";

/** Full-viewport layer above portfolio chrome for pixel-accurate Paper frames. */
export default function DialogueIsolatedChrome({
  children,
  width,
  height,
}: {
  children: ReactNode;
  width: number;
  height: number;
}) {
  return (
    <div
      className={`${dialogueSans.variable} ${dialogueMono.variable} [font-synthesis:none] antialiased`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999997,
        background: "#F8F6F3",
        overflow: "auto",
        fontFamily: "var(--font-dialogue-sans), system-ui, sans-serif",
      }}
    >
      <div
        data-dialogue-frame-root
        style={{
          width,
          minHeight: height,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
