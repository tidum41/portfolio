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
    /** Neutral stone ramp (light to dark) for non-focal bars */
    stoneRamp: [
      "var(--dp-chart-ramp-1)",
      "var(--dp-chart-ramp-2)",
      "var(--dp-chart-ramp-3)",
      "var(--dp-chart-ramp-4)",
      "var(--dp-chart-ramp-5)",
    ] as const,
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
};

/** Stone ramp by index; focal always cherry. */
export function chartBarFill(index: number, focal?: boolean): string {
  if (focal) return dialogueChartSpec.color.focal;
  const ramp = dialogueChartSpec.color.stoneRamp;
  return ramp[Math.min(index, ramp.length - 1)]!;
}

/** Descending magnitude → darker stone (Carbon sequential intuition). */
export function chartBarFillByMagnitude(
  value: number,
  max: number,
  focal?: boolean
): string {
  if (focal) return dialogueChartSpec.color.focal;
  const ramp = dialogueChartSpec.color.stoneRamp;
  if (max <= 0) return ramp[0]!;
  const t = value / max;
  const idx = Math.min(ramp.length - 1, Math.max(0, Math.round(t * (ramp.length - 1))));
  return ramp[idx]!;
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
