"use client";


import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";


/** Grid pill copy. Hover states intent, the tap note confirms it in full. */
export const DIALOGUE_HOVER_LABEL = "Coming Soon";
export const DIALOGUE_TAP_LABEL = "Case Study Coming Soon";
/** Alias kept for existing imports: the shared label is the tap label. */
export const DIALOGUE_PILL_LABEL = DIALOGUE_TAP_LABEL;


/** Shared pill chrome for the grid hover pill and the Dialogue tap note.
 *  Radius is the site --radius-control (8px), shadow is the single cheap
 *  --shadow-pill, fills are solid opaque tokens from globals.css. No
 *  border, no translucency, no backdrop-filter, no filter animation. */
export const PILL_STYLE: CSSProperties = {
  padding: "6px 10px",
  background: "var(--color-lilac)",
  color: "var(--color-lilac-ink)",
  borderRadius: "var(--radius-control)",
  boxShadow: "var(--shadow-pill)",
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  fontSize: 13,
  lineHeight: "16px",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  userSelect: "none",
};


/** Hover variant: light lilac fill, dark ink (7.19:1). */
export const HOVER_PILL_STYLE: CSSProperties = { ...PILL_STYLE, boxShadow: "none" };


/** Tap variant: rose fill, white ink (5.39:1), distinct from hover lilac. */
export const TAP_PILL_STYLE: CSSProperties = {
  ...PILL_STYLE,
  background: "var(--color-tap-rose)",
  color: "var(--color-tap-rose-ink)",
};


const DISMISS_MS = 2000;
const FADE_MS = 120;


/** Dialogue has no case study yet: click, tap, Enter or Space shows tap
 *  feedback instead of navigating. The media cover crossfades to a
 *  permanently blurred duplicate of itself: the duplicate layer's
 *  filter: blur(8px) is static and never animated, its 1.05 scale hides
 *  the blur edge bleed, and only the wrapper opacity animates. The rose
 *  tap pill is centred over the blurred cover. The live region stays
 *  mounted, empty when closed, so screen readers announce the note; it
 *  auto-dismisses after 2s. The fade runs only when the user allows
 *  motion, checked with matchMedia at activation time; reduced motion
 *  gets an instant show and hide. An optional blurLayer overrides the
 *  duplicated media if a dedicated duplicate is supplied. */
export default function DialogueCardTap({
  media,
  blurLayer,
  label,
}: {
  media: ReactNode;
  /** Optional dedicated duplicate for the blurred cover; defaults to `media`. */
  blurLayer?: ReactNode;
  label?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [fade, setFade] = useState(false);
  /** Mount blur cover only while open/fading so idle grid hover stays cheap. */
  const [coverMounted, setCoverMounted] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const unmountTimer = useRef<number | undefined>(undefined);


  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(unmountTimer.current);
    },
    [],
  );


  const show = () => {
    const allowFade = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    setFade(allowFade);
    window.clearTimeout(unmountTimer.current);
    setCoverMounted(true);
    setOpen(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(false);
      // Unmount after opacity fade so idle hover pays nothing for the cover.
      unmountTimer.current = window.setTimeout(
        () => setCoverMounted(false),
        allowFade ? FADE_MS : 0,
      );
    }, DISMISS_MS);
  };


  const transition = open && fade ? `opacity ${FADE_MS}ms ease-out` : "none";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Dialogue, generative answers for UX research. ${DIALOGUE_TAP_LABEL}`}
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
      <div style={{ position: "relative" }}>
        {media}
        {/* Mounted only while open/fading: static filter, opacity-only fade. */}
        {coverMounted ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              opacity: open ? 1 : 0,
              transition,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-2.5%",
                width: "105%",
                height: "105%",
                filter: "blur(8px)",
                transform: "scale(1.05)",
                transformOrigin: "center",
              }}
            >
              {blurLayer ?? media}
            </div>
          </div>
        ) : null}
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: open ? 1 : 0,
            transition,
            pointerEvents: "none",
          }}
        >
          {/* Pill box exists only while open: while closed the live region
              stays mounted and empty, and no shadowed rose box is painted
              or promoted during idle grid hover. */}
          {open ? <span style={TAP_PILL_STYLE}>{DIALOGUE_TAP_LABEL}</span> : null}
        </div>
      </div>
      {label}
    </div>
  );
}
