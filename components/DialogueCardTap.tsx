"use client";


import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";


export const DIALOGUE_PILL_LABEL = "Case Study Coming Soon";


/** Shared chrome for the tap note and the grid hover pill: one opaque
 *  dark badge, #FFFFFF on #2E2E2E at 13.58:1. No translucency, no
 *  backdrop-filter, no blur, no color-mix on the fill. */
export const PILL_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  padding: "6px 10px",
  background: "#2E2E2E",
  border: "1px solid #2E2E2E",
  borderRadius: "var(--radius-control)",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.16)",
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 13,
  lineHeight: "16px",
  color: "#FFFFFF",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};


/** Dialogue has no case study yet: a click, tap, Enter or Space shows a
 *  pill identical to the grid hover pill instead of navigating. The note's
 *  live region stays mounted (empty when closed) so screen readers announce
 *  it, and the 120ms fade runs only when the user allows motion, checked
 *  with matchMedia at activation time. */
export default function DialogueCardTap({
  media,
  label,
}: {
  media: ReactNode;
  label: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [fade, setFade] = useState(false);
  const timer = useRef<number | undefined>(undefined);


  useEffect(() => () => window.clearTimeout(timer.current), []);


  const show = () => {
    setFade(
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches,
    );
    setOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 2000);
  };


  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Dialogue, generative answers for UX research. ${DIALOGUE_PILL_LABEL}`}
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
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", containerType: "inline-size" }}>
        {media}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="dialogue-tap-note"
          data-open={open ? "true" : "false"}
          style={{
            ...PILL_STYLE,
            position: "absolute",
            left: "50%",
            bottom: "clamp(9px, 2.8cqw, 12px)",
            transform: "translateX(-50%)",
            maxWidth: "calc(100% - 24px)",
            padding:
              "clamp(4px, 1.3cqw, 6px) clamp(8px, 2.5cqw, 10px)",
            fontSize: "clamp(11.5px, 3.4cqw, 13px)",
            lineHeight: "clamp(14px, 4.2cqw, 16px)",
            textAlign: "center",
            zIndex: 3,
            opacity: open ? 1 : 0,
            transition: open && fade ? "opacity 120ms ease-out" : "none",
          }}
        >
          {open ? DIALOGUE_PILL_LABEL : ""}
        </div>
      </div>
      {label}
    </div>
  );
}
