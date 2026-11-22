import type { ChartStackSegment } from "@/components/dialogue/product/chart/ChartStackedBar";

/** Static bar fill roles for the homepage thumbnail (not selection state). */
export type ThumbnailBarTone = "focal" | "mid" | "soft" | "neutral";

/**
 * The one place a thumbnail tone meets a colour: each tone maps to its ramp
 * B token (cherry #B43F7F, #D392AB, #D5B3BE, stone #D6D3D1). The card CSS
 * paints `[data-tone]` segments and swatches with exactly these tokens, and
 * `npm run check:thumbnail-card` reads this map to fail any other fill.
 */
export const THUMBNAIL_BAR_TONE_TOKEN = {
  focal: "--dp-chart-focal",
  mid: "--dp-chart-mid",
  soft: "--dp-chart-soft",
  neutral: "--dp-border-strong",
} as const satisfies Record<ThumbnailBarTone, `--dp-${string}`>;

export type ThumbnailBarToken = (typeof THUMBNAIL_BAR_TONE_TOKEN)[ThumbnailBarTone];

/**
 * A segment as the card's callers write it: data only. The tone comes from
 * the ramp below, so a caller cannot pass its own tone or a colour.
 */
export type ThumbnailSegmentInput = Omit<ChartStackSegment, "tone"> & {
  tone?: never;
  color?: never;
  fill?: never;
  background?: never;
};

/**
 * Picks ramp B fills by segment count. Two segments pair cherry with Dialogue
 * neutral stone (--dp-border-strong / --ds-stone-300). Three or more step
 * through mid and soft, then neutral for the tail.
 */
export function thumbnailBarTone(
  index: number,
  segmentCount: number,
  focal?: boolean,
): ThumbnailBarTone {
  if (focal) return "focal";
  if (segmentCount === 2) return "neutral";
  if (index === 1) return "mid";
  if (index === 2) return "soft";
  return "neutral";
}

export function withThumbnailBarRamp<T extends ThumbnailSegmentInput>(
  segments: T[],
): (Omit<T, "tone"> & { tone: ThumbnailBarTone })[] {
  const n = segments.length;
  return segments.map((seg, i) => ({ ...seg, tone: thumbnailBarTone(i, n, seg.focal) }));
}
