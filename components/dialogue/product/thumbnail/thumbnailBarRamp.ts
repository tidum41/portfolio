import type { ChartStackSegment } from "@/components/dialogue/product/chart/ChartStackedBar";

/** Static bar fill roles for the homepage thumbnail (not selection state). */
export type ThumbnailBarTone = "focal" | "mid" | "soft" | "neutral";

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

export function withThumbnailBarRamp<T extends ChartStackSegment>(segments: T[]): (T & { tone: ThumbnailBarTone })[] {
  const n = segments.length;
  return segments.map((seg, i) => ({ ...seg, tone: thumbnailBarTone(i, n, seg.focal) }));
}
