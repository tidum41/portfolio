export type ThumbnailVariantId = "product" | "story" | "tight" | "lift-explore";

export type ThumbnailTiming = {
  id: ThumbnailVariantId;
  label: string;
  /** Quiet hold on the poster before the cursor moves. */
  restMs: number;
  /** Cursor travel to the next segment. */
  moveMs: number;
  /** Hover effect on the target before the press. */
  hoverMs: number;
  /** Press squeeze. */
  pressMs: number;
  /** How long the opened side is held. */
  payoffMs: number;
  /** CSS easing for cursor travel. */
  ease: string;
};

/** Three timing cuts of the same story: open the 75, then return to the 225. */
export const THUMBNAIL_VARIANTS: Record<ThumbnailVariantId, ThumbnailTiming> = {
  product: {
    id: "product",
    label: "Product pace",
    restMs: 400,
    moveMs: 450,
    hoverMs: 150,
    pressMs: 160,
    payoffMs: 2000,
    ease: "cubic-bezier(0.45, 0, 0.1, 1)",
  },
  story: {
    id: "story",
    label: "Storytelling",
    restMs: 600,
    moveMs: 800,
    hoverMs: 220,
    pressMs: 200,
    payoffMs: 2000,
    ease: "cubic-bezier(0.45, 0, 0.1, 1)",
  },
  tight: {
    id: "tight",
    label: "Tight overlap",
    restMs: 250,
    moveMs: 320,
    hoverMs: 120,
    pressMs: 140,
    payoffMs: 1200,
    ease: "cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
  /** Dev-only: lift-and-marker bar exploration (not used on the homepage card). */
  "lift-explore": {
    id: "lift-explore",
    label: "Lift marker (exploration)",
    restMs: 250,
    moveMs: 320,
    hoverMs: 120,
    pressMs: 140,
    payoffMs: 1200,
    ease: "cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
};

export const DEFAULT_THUMBNAIL_VARIANT: ThumbnailVariantId = "product";

export function thumbnailBarStyleForVariant(variant: ThumbnailVariantId): "states" | "lift-explore" {
  return variant === "lift-explore" ? "lift-explore" : "states";
}

/** Cursor choreography constants, shared by the autoplay loop and the scrub timeline. */
export const THUMBNAIL_CURSOR_LEAD_MS = 200;
export const THUMBNAIL_CURSOR_OUT_MS = 300;

export type ThumbnailSide = "friday" | "unsure";
export type ThumbnailSelection = ThumbnailSide | "none";
export type ThumbnailCursorMode =
  | "off"
  | "lead-unsure"
  | "to-unsure"
  | "at-unsure"
  | "to-friday"
  | "at-friday";

/** Everything the demo renders at one instant, as a pure function of time. */
export type ThumbnailFrameState = {
  beat: string;
  side: ThumbnailSelection;
  hover: ThumbnailSide | null;
  press: ThumbnailSide | null;
  pressing: boolean;
  cursorOn: boolean;
  cursorMode: ThumbnailCursorMode;
  /** Travel progress 0..1 for the to-* cursor modes. */
  cursorP: number;
};

export type ThumbnailPhase = { beat: string; label: string; start: number; end: number };

export function thumbnailLoopDuration(timing: ThumbnailTiming): number {
  return (
    timing.restMs +
    THUMBNAIL_CURSOR_LEAD_MS +
    timing.moveMs +
    timing.hoverMs +
    timing.pressMs +
    timing.payoffMs +
    timing.moveMs +
    timing.hoverMs +
    timing.pressMs +
    timing.payoffMs +
    THUMBNAIL_CURSOR_OUT_MS
  );
}

/** Display phases for rulers and galleries; move phases include the cursor lead-in. */
export function thumbnailPhases(timing: ThumbnailTiming): ThumbnailPhase[] {
  const { restMs: rest, moveMs: move, hoverMs: hover, pressMs: press, payoffMs: payoff } = timing;
  const lead = THUMBNAIL_CURSOR_LEAD_MS;
  const out = THUMBNAIL_CURSOR_OUT_MS;
  let t = 0;
  const ph = (beat: string, label: string, dur: number): ThumbnailPhase => {
    const p = { beat, label, start: t, end: t + dur };
    t += dur;
    return p;
  };
  return [
    ph("poster", "None", rest),
    ph("move-unsure", "Move", lead + move),
    ph("hover-unsure", "Hover, Unsure", hover),
    ph("press-unsure", "Press, Unsure", press),
    ph("unsure", "Open, Unsure", payoff),
    ph("move-friday", "Move", move),
    ph("hover-friday", "Hover, Friday", hover),
    ph("press-friday", "Press, Friday", press),
    ph("poster", "Open, Friday", payoff + out),
  ];
}

/**
 * The loop as a pure function of time, mirroring the autoplay choreography
 * beat for beat, so a scrubber can land on any frame exactly.
 */
export function thumbnailStateAt(timing: ThumbnailTiming, timeMs: number): ThumbnailFrameState {
  const total = thumbnailLoopDuration(timing);
  let t = ((timeMs % total) + total) % total;
  const { restMs: rest, moveMs: move, hoverMs: hover, pressMs: press, payoffMs: payoff } = timing;
  const seg = (dur: number) => {
    const at = t;
    t -= dur;
    return at >= 0 && at < dur ? at : -1;
  };
  const base = { hover: null, press: null, pressing: false } as const;
  let p: number;
  if ((p = seg(rest)) >= 0)
    return { ...base, beat: "poster", side: "none", cursorOn: false, cursorMode: "off", cursorP: 0 };
  if ((p = seg(THUMBNAIL_CURSOR_LEAD_MS)) >= 0)
    return { ...base, beat: "move-unsure", side: "none", cursorOn: true, cursorMode: "lead-unsure", cursorP: 0 };
  if ((p = seg(move)) >= 0)
    return { ...base, beat: "move-unsure", side: "none", cursorOn: true, cursorMode: "to-unsure", cursorP: move ? p / move : 1 };
  if ((p = seg(hover)) >= 0)
    return { ...base, beat: "hover-unsure", side: "none", hover: "unsure", cursorOn: true, cursorMode: "at-unsure", cursorP: 1 };
  if ((p = seg(press)) >= 0)
    return { beat: "press-unsure", side: "none", hover: "unsure", press: "unsure", pressing: true, cursorOn: true, cursorMode: "at-unsure", cursorP: 1 };
  if ((p = seg(payoff)) >= 0)
    return { ...base, beat: "unsure", side: "unsure", cursorOn: true, cursorMode: "at-unsure", cursorP: 1 };
  if ((p = seg(move)) >= 0)
    return { ...base, beat: "move-friday", side: "unsure", cursorOn: true, cursorMode: "to-friday", cursorP: move ? p / move : 1 };
  if ((p = seg(hover)) >= 0)
    return { ...base, beat: "hover-friday", side: "unsure", hover: "friday", cursorOn: true, cursorMode: "at-friday", cursorP: 1 };
  if ((p = seg(press)) >= 0)
    return { beat: "press-friday", side: "unsure", hover: "friday", press: "friday", pressing: true, cursorOn: true, cursorMode: "at-friday", cursorP: 1 };
  if ((p = seg(payoff)) >= 0)
    return { ...base, beat: "poster", side: "friday", cursorOn: true, cursorMode: "at-friday", cursorP: 1 };
  return { ...base, beat: "poster", side: "friday", cursorOn: false, cursorMode: "at-friday", cursorP: 1 };
}
