export type AnswerGroup = { label: string; value: number; focal?: boolean };

/** Past this many groups the bar has no room to tell its segments apart; the answer returns one named row per group. */
export const BAR_MAX_GROUPS = 2;
/** Longest group label, in characters, that stays on one line when both lanes share the legend row in the 471px stage panel (measured: 26 fits, 28 wraps). */
export const BAR_MAX_LABEL = 26;

/** True when the groups are one split of the whole (each person in exactly one group), so a stacked bar is honest. */
export function isSplit(groups: AnswerGroup[], total: number): boolean {
  return groups.reduce((n, g) => n + g.value, 0) === total;
}

/** One rule for every answer: two short groups keep the single bar, anything else returns rows.
 *  Depth r4: when the total is given, groups that overlap or do not cover it (ranked asks, where one shopper can ask
 *  for two things) always return rows, because a stacked bar would claim they split the whole. */
export function answerLayout(groups: AnswerGroup[], total?: number): "bar" | "rows" {
  if (total !== undefined && !isSplit(groups, total)) return "rows";
  return groups.length > BAR_MAX_GROUPS || groups.some((g) => g.label.length > BAR_MAX_LABEL) ? "rows" : "bar";
}
