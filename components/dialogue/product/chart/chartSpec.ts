/**
 * Dialogue chart system tokens — see design/briefs/dialogue-chart-spec.md (t385).
 * Grounded in IBM Carbon data-viz; type roles from t384 dialogue-ds-tokens.
 */

export const dialogueChartSpec = {
  /** Cite: design/briefs/dialogue-chart-spec.md */
  doc: "design/briefs/dialogue-chart-spec.md",
  sources: {
    primary: "https://carbondesignsystem.com/data-visualization/axes-and-labels/",
    color: "https://carbondesignsystem.com/data-visualization/color-palettes/",
    legends: "https://carbondesignsystem.com/data-visualization/legends/",
    ibmBasics: "https://www.ibm.com/design/language/data-visualization/design/basics/",
  },
  text: {
    /** Chart label role — Dialogue small (t384); not measured on a live chart */
    label: {
      size: "var(--text-chart-size)",
      weight: "var(--dp-weight-normal)",
      leading: "var(--text-chart-leading)",
      color: "var(--dp-chart-label-color)",
    },
    /** Chart value role */
    value: {
      size: "var(--text-chart-size)",
      weight: "var(--dp-weight-normal)",
      leading: "var(--text-chart-leading)",
      color: "var(--dp-chart-value-color)",
      focalWeight: "var(--dp-weight-medium)",
      focalColor: "var(--dp-chart-focal)",
    },
  },
  color: {
    focal: "var(--dp-chart-focal)",
    /** Every non-focal data fill. Stone-500, 3:1 or better on the track and card. */
    muted: "var(--dp-chart-muted)",
    mutedAlt: "var(--dp-chart-muted-alt)",
    track: "var(--dp-chart-track)",
    gridline: "var(--dp-chart-gridline)",
    baseline: "var(--dp-chart-baseline)",
    line: "var(--dp-chart-line)",
    lineFocal: "var(--dp-chart-focal)",
  },
  bar: {
    thickness: 8,
    trackRadius: 2,
    rowGap: 10,
    labelWidth: 110,
    valueWidth: 40,
    gutter: 8,
    minWidth: 240,
  },
  line: {
    strokeWidth: 2,
    dotRadius: 3,
    focalDotRadius: 3.5,
    /** Intrinsic CSS/SVG px so 12 user-units ≈ 12px (no label upscale) */
    plotWidth: 320,
    plotHeight: 140,
    padLeft: 28,
    padRight: 12,
    padTop: 22,
    padBottom: 28,
  },
  rank: {
    rowGap: 10,
    rankWidth: 16,
  },
  layout: {
    minWidth: 240,
    maxWidth: "100%",
    captionGap: 8,
  },
} as const;

export type ChartBarDatum = {
  label: string;
  /** Numeric magnitude; bar width = value / max */
  value: number;
  /** Display string; defaults to formatted value */
  display?: string;
  focal?: boolean;
  /** Quiet secondary figure shown after the value (for example the drop at a step). */
  detail?: string;
  /** P15 item 11: share shown on hover, e.g. "64%". */
  pct?: string;
};

/** Cherry for the focal bar, stone-500 for everything else. */
export function chartBarFill(_index: number, focal?: boolean): string {
  return focal ? dialogueChartSpec.color.focal : dialogueChartSpec.color.muted;
}

/** Magnitude is carried by bar length; the fill stays stone-500 (no light ramp steps). */
export function chartBarFillByMagnitude(_value: number, _max: number, focal?: boolean): string {
  return chartBarFill(0, focal);
}

export function formatChartPercent(n: number): string {
  return `${Math.round(n)}%`;
}

export function formatChartCount(n: number): string {
  return String(Math.round(n));
}

export function formatChartDecimal(n: number, digits = 1): string {
  return n.toFixed(digits);
}
