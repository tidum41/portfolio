"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * A recorded-looking pointer for the product loops. It lives inside the loop's stage (the
 * zoomed product wrapper), so it scales with the UI the way a screen recording would, and it
 * sits outside any panel that remounts, so it never jumps.
 *
 * The loop drives it with one cue per step:
 *  - `off`: hidden (also what reduced motion gets, and the CSS hides it there too),
 *  - `away`: parked at `away` (fractions of the stage), as an arrow,
 *  - `travel`: easing to the target, still an arrow,
 *  - `over`: on the target, in the target's shape (the prototype uses a hand on buttons and links),
 *  - `press`: on the target, pressed (a short scale; the button shows its own active state).
 * Case-study layer, not product UI.
 */

export type CursorShape = "arrow" | "hand" | "text";
export type CursorPhase = "off" | "away" | "travel" | "over" | "press";

export type CursorCue = {
  phase: CursorPhase;
  /** Selector inside the stage for travel, over and press. */
  target?: string;
  /** Shape on the target. Defaults to the hand the prototype shows on buttons. */
  shape?: CursorShape;
  /** Point on the target, as fractions of its box. */
  at?: readonly [number, number];
};

type Point = { x: number; y: number };

type Props = {
  stage: RefObject<HTMLElement | null>;
  cue: CursorCue;
  /** Where the pointer rests between actions, as fractions of the stage. */
  away?: readonly [number, number];
};

const DEFAULT_AT = [0.55, 0.6] as const;
// Just under the stage, in the well's padding, so a parked pointer never covers the product UI.
const DEFAULT_AWAY = [0.86, 1.06] as const;

function measure(stage: HTMLElement, cue: CursorCue, away: readonly [number, number]): Point | null {
  const s = stage.getBoundingClientRect();
  // The stage may be zoomed; positions are set in its own (unzoomed) pixels.
  const z = stage.offsetWidth ? s.width / stage.offsetWidth : 1;
  if (cue.phase === "away" || cue.phase === "off" || !cue.target) {
    return { x: stage.offsetWidth * away[0], y: stage.offsetHeight * away[1] };
  }
  const el = stage.querySelector(cue.target);
  if (!el) return null;
  const t = el.getBoundingClientRect();
  const at = cue.at ?? DEFAULT_AT;
  return { x: (t.left - s.left + t.width * at[0]) / z, y: (t.top - s.top + t.height * at[1]) / z };
}

export default function DemoCursor({ stage, cue, away = DEFAULT_AWAY }: Props) {
  const [pos, setPos] = useState<Point | null>(null);
  // The first placement jumps (no travel from the corner); every later move eases.
  const [placed, setPlaced] = useState(false);
  const last = useRef<Point | null>(null);

  // A passive effect, so the stage's ref (set after this child commits) is there on mount.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const update = () => {
      // A target that just went away (the button a click removed) keeps the last point.
      const p = measure(el, cue, away) ?? last.current;
      if (p) {
        last.current = p;
        setPos(p);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stage, cue, away]);

  useEffect(() => {
    if (!pos || placed) return;
    const id = requestAnimationFrame(() => setPlaced(true));
    return () => cancelAnimationFrame(id);
  }, [pos, placed]);

  const shape: CursorShape = cue.phase === "over" || cue.phase === "press" ? (cue.shape ?? "hand") : "arrow";
  const hidden = cue.phase === "off" || !pos;
  return (
    <span
      className={`jp-cursor${hidden ? " is-off" : ""}${placed ? "" : " is-instant"}${cue.phase === "press" ? " is-press" : ""}`}
      style={pos ? { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` } : undefined}
      aria-hidden="true"
    >
      <span className="jp-cursor__glyph">
        {shape === "arrow" ? <ArrowGlyph /> : shape === "hand" ? <HandGlyph /> : <TextGlyph />}
      </span>
    </span>
  );
}

/* macOS-style glyphs. Each one is drawn so its hotspot sits at the element's origin. */
function ArrowGlyph() {
  return (
    <svg className="jp-cursor__svg jp-cursor__svg--arrow" width="18" height="26" viewBox="0 0 18 26">
      <path d="M1 1v19.2l4.6-4.4 3 7 3.2-1.4-3-6.8H15z" fill="var(--jp-cursor-ink)" stroke="var(--jp-cursor-halo)" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function HandGlyph() {
  return (
    <svg className="jp-cursor__svg jp-cursor__svg--hand" width="22" height="24" viewBox="0 0 22 24">
      <path
        d="M7.5 1.2c1 0 1.8.8 1.8 1.8v6.2l.8-.1c.9-.1 1.7.5 1.9 1.3.5-.5 1.2-.7 1.9-.5.8.2 1.3.8 1.5 1.5.5-.4 1.2-.6 1.9-.4.9.2 1.5 1.1 1.5 2v4.3c0 3.4-2.7 6.1-6.1 6.1h-1.6c-1.9 0-3.6-.9-4.7-2.5L2.7 15.6c-.5-.8-.4-1.8.4-2.4.7-.5 1.8-.4 2.3.3l.3.4V3c0-1 .8-1.8 1.8-1.8z"
        fill="var(--jp-cursor-halo)" stroke="var(--jp-cursor-ink)" strokeWidth="1.2" strokeLinejoin="round"
      />
      <path d="M11.4 15.5v4M14.4 15.5v4M17.4 15.5v4" stroke="var(--jp-cursor-ink)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function TextGlyph() {
  return (
    <svg className="jp-cursor__svg jp-cursor__svg--text" width="12" height="20" viewBox="0 0 12 20">
      <path d="M2 1.5h1.6c1 0 1.9.4 2.4 1 .5-.6 1.4-1 2.4-1H10M2 18.5h1.6c1 0 1.9-.4 2.4-1 .5.6 1.4 1 2.4 1H10M6 2.6v14.8" fill="none" stroke="var(--jp-cursor-halo)" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 1.5h1.6c1 0 1.9.4 2.4 1 .5-.6 1.4-1 2.4-1H10M2 18.5h1.6c1 0 1.9-.4 2.4-1 .5.6 1.4 1 2.4 1H10M6 2.6v14.8" fill="none" stroke="var(--jp-cursor-ink)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
