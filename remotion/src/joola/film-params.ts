/**
 * Live-tunable film knobs for the Remotion playground.
 * Defaults match remotion/src/joola/timeline.ts (pass 40).
 * Playground writes overrides each render via setFilmParams().
 */
export type CamEaseId = "cam" | "flow" | "move";
export type PtrEaseId = "ptr" | "flow";

export type FilmParams = {
  /** Shot A — search field */
  shotACx: number;
  shotACy: number;
  shotAZoom: number;
  /** Shot qty / line */
  shotQtyCx: number;
  shotQtyCy: number;
  shotQtyZoom: number;
  /** Pull-back: saved orders rail */
  shotSavedCx: number;
  shotSavedCy: number;
  shotSavedZoom: number;
  /** Whole order hold */
  shotOrderCx: number;
  shotOrderCy: number;
  shotOrderZoom: number;
  /** Shared scale for summary + order-placed cards */
  cardScale: number;
  /** Open push length in frames (start fixed at OPEN_MOVE[0]) */
  openMoveDuration: number;
  /** Zoom-out-to-line length in frames */
  zoomOutDuration: number;
  /** Pull-back to saved orders length */
  revealDuration: number;
  /** Zoom out to kit lines length */
  zoomLinesDuration: number;
  /** Pill width / digit / badge roll length */
  pillFillDuration: number;
  /** Order-placed recenter length */
  confRecenterDuration: number;
  /** Logo leave length at the open */
  logoOutDuration: number;
  /** Camera move easing preset */
  camEase: CamEaseId;
  /** Cursor travel easing preset */
  ptrEase: PtrEaseId;
  /** On-screen cursor scale (absolute, pass-40 default ≈ 2.875) */
  cursorScale: number;
};

/** Pass-40 defaults — keep in sync with timeline.ts / pointer.ts. */
export const FILM_DEFAULTS: FilmParams = {
  shotACx: 440,
  shotACy: 148.4,
  shotAZoom: 3.45,
  shotQtyCx: 782,
  shotQtyCy: 360,
  shotQtyZoom: 3,
  shotSavedCx: 1016,
  shotSavedCy: 486,
  shotSavedZoom: 2.55,
  shotOrderCx: 768,
  shotOrderCy: 378,
  shotOrderZoom: 1.35,
  cardScale: 2.68,
  openMoveDuration: 18,
  zoomOutDuration: 24,
  revealDuration: 24,
  zoomLinesDuration: 22,
  pillFillDuration: 14,
  confRecenterDuration: 10,
  logoOutDuration: 5,
  camEase: "cam",
  ptrEase: "ptr",
  cursorScale: 1.25 * 1.6 * 1.15 * 1.25,
};

let current: FilmParams = FILM_DEFAULTS;

export function setFilmParams(next: FilmParams | null | undefined) {
  current = next ?? FILM_DEFAULTS;
}

export function getFilmParams(): FilmParams {
  return current;
}

/** Human labels + file paths for the Copy-for-agent prompt. */
export const FILM_PARAM_META: Record<
  keyof FilmParams,
  { label: string; path: string }
> = {
  shotACx: { label: "SHOT_A.cx", path: "remotion/src/joola/timeline.ts" },
  shotACy: { label: "SHOT_A.cy", path: "remotion/src/joola/timeline.ts" },
  shotAZoom: { label: "SHOT_A.s", path: "remotion/src/joola/timeline.ts" },
  shotQtyCx: { label: "SHOT_QTY.cx", path: "remotion/src/joola/timeline.ts" },
  shotQtyCy: { label: "SHOT_QTY.cy", path: "remotion/src/joola/timeline.ts" },
  shotQtyZoom: { label: "SHOT_QTY.s", path: "remotion/src/joola/timeline.ts" },
  shotSavedCx: { label: "SHOT_SAVED.cx", path: "remotion/src/joola/timeline.ts" },
  shotSavedCy: { label: "SHOT_SAVED.cy", path: "remotion/src/joola/timeline.ts" },
  shotSavedZoom: { label: "SHOT_SAVED.s", path: "remotion/src/joola/timeline.ts" },
  shotOrderCx: { label: "SHOT_ORDER.cx", path: "remotion/src/joola/timeline.ts" },
  shotOrderCy: { label: "SHOT_ORDER.cy", path: "remotion/src/joola/timeline.ts" },
  shotOrderZoom: { label: "SHOT_ORDER.s", path: "remotion/src/joola/timeline.ts" },
  cardScale: { label: "CARD_S", path: "remotion/src/joola/timeline.ts" },
  openMoveDuration: {
    label: "OPEN_MOVE duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  zoomOutDuration: {
    label: "ZOOM_OUT duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  revealDuration: {
    label: "REVEAL duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  zoomLinesDuration: {
    label: "ZOOM_LINES duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  pillFillDuration: {
    label: "ROLL_PILL_F",
    path: "remotion/src/joola/timeline.ts",
  },
  confRecenterDuration: {
    label: "CONF_RECENTER duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  logoOutDuration: {
    label: "LOGO_OUT duration (frames)",
    path: "remotion/src/joola/timeline.ts",
  },
  camEase: { label: "camera ease preset", path: "remotion/src/joola/timeline.ts" },
  ptrEase: { label: "cursor travel ease preset", path: "remotion/src/joola/pointer.ts" },
  cursorScale: { label: "CURSOR_SCALE", path: "remotion/src/joola/pointer.ts" },
};

export function diffFilmParams(values: FilmParams): Array<{
  key: keyof FilmParams;
  label: string;
  path: string;
  from: string | number;
  to: string | number;
}> {
  const out: Array<{
    key: keyof FilmParams;
    label: string;
    path: string;
    from: string | number;
    to: string | number;
  }> = [];
  (Object.keys(FILM_DEFAULTS) as (keyof FilmParams)[]).forEach((key) => {
    const from = FILM_DEFAULTS[key];
    const to = values[key];
    if (from === to) return;
    if (typeof from === "number" && typeof to === "number") {
      if (Math.abs(from - to) < 1e-6) return;
    }
    const meta = FILM_PARAM_META[key];
    out.push({ key, label: meta.label, path: meta.path, from, to });
  });
  return out;
}

export function buildAgentCopy(values: FilmParams): string {
  const diffs = diffFilmParams(values);
  const lines = [
    "JOOLA B2B Remotion film tweak",
    "",
    "Composition: remotion/src/JoolaB2B.tsx (id JoolaB2B)",
    "Timeline: remotion/src/joola/timeline.ts",
    "Pointer: remotion/src/joola/pointer.ts",
    "Root: remotion/src/Root.tsx",
    "",
  ];
  if (diffs.length === 0) {
    lines.push("No params changed from defaults.");
  } else {
    lines.push("Changed params (name: old → new):");
    for (const d of diffs) {
      lines.push(`- ${d.label}: ${formatVal(d.from)} → ${formatVal(d.to)}`);
    }
    lines.push("");
    lines.push("Apply these as the new defaults in the files above.");
  }
  return lines.join("\n");
}

function formatVal(v: string | number): string {
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
  }
  return v;
}
