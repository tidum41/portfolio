export type AnswerGroup = { label: string; value: number; focal?: boolean };

/** Past this many groups the bar has no room to tell its segments apart; the answer returns one named row per group. */
export const BAR_MAX_GROUPS = 2;
/** Longest group label, in characters, that stays on one line when both lanes share the legend row in the 471px stage panel (measured: 26 fits, 28 wraps). */
export const BAR_MAX_LABEL = 26;

/** One rule for every answer: two short groups keep the single bar, anything else returns rows. */
export function answerLayout(groups: AnswerGroup[]): "bar" | "rows" {
  return groups.length > BAR_MAX_GROUPS || groups.some((g) => g.label.length > BAR_MAX_LABEL) ? "rows" : "bar";
}
