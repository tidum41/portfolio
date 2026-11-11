export type ThumbnailVariantId = "product" | "story" | "tight";

export type ThumbnailTiming = {
  id: ThumbnailVariantId;
  label: string;
  /** Quiet hold on the poster before the cursor moves. */
  restMs: number;
  /** Cursor travel to the next segment. */
  moveMs: number;
  /** Outline on the target before the press. */
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
};

export const DEFAULT_THUMBNAIL_VARIANT: ThumbnailVariantId = "product";
