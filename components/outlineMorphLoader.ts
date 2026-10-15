/** Same timing the /dev/nav-morph preview was approved at. */
export const OUTLINE_MORPH_S = 0.32;

export type OutlineMorphComponent = typeof import("./OutlineMorphWord").default;

let pending: Promise<OutlineMorphComponent> | null = null;

/** One shared import of the nav-letter morph, including its path data. */
export function loadOutlineMorph(): Promise<OutlineMorphComponent> {
  pending ??= import("./OutlineMorphWord").then((mod) => mod.default);
  return pending;
}
