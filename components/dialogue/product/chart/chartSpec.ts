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
      size: "12px",
      weight: "400",
      leading: "16px",
      color: "#57534d",
    },
    /** Chart value role */
    value: {
      size: "12px",
      weight: "400",
      leading: "16px",
      color: "#1c1917",
      focalWeight: "600",
      focalColor: "#b43f7f",
    },
  },
  color: {
    focal: "#b43f7f",
    /** Neutral stone ramp (light → dark) for non-focal bars */
    stoneRamp: ["#e7e5e4", "#d6d3d1", "#a8a29e", "#78716c", "#57534d"] as const,
    track: "#f1eeea",
    gridline: "rgb(231 229 228 / 60%)",
    baseline: "#e7e5e4",
    line: "#57534d",
    lineFocal: "#b43f7f",
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
    strokeWidth: 1.5,
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

/** CSS variables for chart primitives (set on .dp-chart-root). */
export function dialogueChartCssVariables(): Record<string, string> {
  const s = dialogueChartSpec;
  return {
    "dp-chart-label-size": s.text.label.size,
    "dp-chart-label-leading": s.text.label.leading,
    "dp-chart-label-weight": s.text.label.weight,
    "dp-chart-label-color": s.text.label.color,
    "dp-chart-value-size": s.text.value.size,
    "dp-chart-value-leading": s.text.value.leading,
    "dp-chart-value-weight": s.text.value.weight,
    "dp-chart-value-color": s.text.value.color,
    "dp-chart-value-focal-weight": s.text.value.focalWeight,
    "dp-chart-focal": s.color.focal,
    "dp-chart-track": s.color.track,
    "dp-chart-gridline": s.color.gridline,
    "dp-chart-baseline": s.color.baseline,
    "dp-chart-line": s.color.line,
    "dp-chart-bar-thickness": `${s.bar.thickness}px`,
    "dp-chart-bar-gap": `${s.bar.rowGap}px`,
    "dp-chart-label-width": `${s.bar.labelWidth}px`,
    "dp-chart-value-width": `${s.bar.valueWidth}px`,
    "dp-chart-gutter": `${s.bar.gutter}px`,
    "dp-chart-min-width": `${s.bar.minWidth}px`,
    "dp-chart-line-stroke": `${s.line.strokeWidth}px`,
    "dp-chart-plot-width": `${s.line.plotWidth}px`,
  };
}
