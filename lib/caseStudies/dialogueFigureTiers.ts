/** Placed figure tiers on `/dialogue` (round 35). */

export type DialogueFigureTier = "full" | "pair" | "trio";

export const DIALOGUE_FIGURE_ASPECT: Record<DialogueFigureTier, number> = {
  full: 16 / 10,
  pair: 4 / 5,
  trio: 4 / 5,
};

/** Canonical chat column for trio comparisons (section-4 export pixels). */
export const DIALOGUE_TRIO_CANONICAL_FRAME = { width: 287, height: 497 };
