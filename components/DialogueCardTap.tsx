"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Dialogue has no case study yet: a click, tap, Enter or Space shows a short
 *  "not available yet" note on the card instead of navigating. The note's
 *  live region stays mounted (empty when closed) so screen readers announce
 *  it, and the 120ms fade runs only when the user allows motion, checked
 *  with matchMedia at activation time. */
export default function DialogueCardTap({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [fade, setFade] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = () => {
    setFade(window.matchMedia("(prefers-reduced-motion: no-preference)").matches);
    setOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 2000);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Dialogue, generative answers for UX research. Case study not available yet"
      onClick={(e) => {
        e.preventDefault();
        show();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show();
        }
      }}
      style={{ position: "relative", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}
    >
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="dialogue-tap-note"
        data-open={open ? "true" : "false"}
        style={{
          position: "absolute",
          left: "50%",
          top: 12,
          transform: "translateX(-50%)",
          padding: "6px 10px",
          background: "var(--color-badge-bg)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-control)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          fontSize: 13,
          lineHeight: "16px",
          color: "var(--color-text-card-sub)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 3,
          opacity: open ? 1 : 0,
          transition: open && fade ? "opacity 120ms ease-out" : "none",
        }}
      >
        {open ? "Case study not available yet" : ""}
      </div>
    </div>
  );
}
