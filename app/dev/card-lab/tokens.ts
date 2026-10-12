/**
 * Tunable numbers for each card-lab direction.
 * Keep these as the single source of truth — CSS vars mirror them in CardLabClient.
 */

export type DirectionId = "framed-inset" | "edge-tile" | "text-first";

export const DIRECTIONS: {
  id: DirectionId;
  label: string;
  short: string;
  hint: string;
}[] = [
  {
    id: "framed-inset",
    label: "Framed inset card",
    short: "Inset",
    hint: "12px outer · 6px pad · concentric media · hairline · label below",
  },
  {
    id: "edge-tile",
    label: "Edge-to-edge tile",
    short: "Tile",
    hint: "Flush media · 12px radius · 8px gutter · small caption under frame",
  },
  {
    id: "text-first",
    label: "Text-first row",
    short: "Text",
    hint: "Title + one-line description · preview on hover · touch fallback",
  },
];

/** Direction 1 — Rauno craft / Adham framed object */
export const FRAMED_INSET = {
  outerRadius: 12,
  pad: 6,
  /** concentric: outer − pad */
  get innerRadius() {
    return this.outerRadius - this.pad;
  },
  gutter: 24,
  labelGap: 14,
  titleSize: 15,
  metaSize: 14,
  titleWeight: 500,
  hoverMs: 200,
  colsDesktop: 2,
} as const;

/** Direction 2 — Devouring Details / Chanh Dai flush tile */
export const EDGE_TILE = {
  radius: 12,
  gutter: 8,
  labelGap: 12,
  titleSize: 13,
  metaSize: 13,
  titleWeight: 400,
  hoverMs: 200,
  colsDesktop: 2,
} as const;

/** Direction 3 — Josh / Emil text list + hover preview */
export const TEXT_FIRST = {
  titleSize: 16,
  descSize: 16,
  titleWeight: 400,
  rowGap: 28,
  titleDescGap: 6,
  hoverMs: 200,
  previewWidth: 320,
  previewRadius: 10,
} as const;

export function tokensToCssVars(): string {
  const fi = FRAMED_INSET;
  const et = EDGE_TILE;
  const tf = TEXT_FIRST;
  return `
    --cl-fi-outer-r: ${fi.outerRadius}px;
    --cl-fi-pad: ${fi.pad}px;
    --cl-fi-inner-r: ${fi.innerRadius}px;
    --cl-fi-gutter: ${fi.gutter}px;
    --cl-fi-label-gap: ${fi.labelGap}px;
    --cl-fi-title: ${fi.titleSize}px;
    --cl-fi-meta: ${fi.metaSize}px;
    --cl-fi-hover: ${fi.hoverMs}ms;

    --cl-et-r: ${et.radius}px;
    --cl-et-gutter: ${et.gutter}px;
    --cl-et-label-gap: ${et.labelGap}px;
    --cl-et-title: ${et.titleSize}px;
    --cl-et-meta: ${et.metaSize}px;
    --cl-et-hover: ${et.hoverMs}ms;

    --cl-tf-title: ${tf.titleSize}px;
    --cl-tf-desc: ${tf.descSize}px;
    --cl-tf-row-gap: ${tf.rowGap}px;
    --cl-tf-title-desc-gap: ${tf.titleDescGap}px;
    --cl-tf-hover: ${tf.hoverMs}ms;
    --cl-tf-preview-w: ${tf.previewWidth}px;
    --cl-tf-preview-r: ${tf.previewRadius}px;
  `;
}
