/** Nested border-radius so inner corners align with outer frame + padding. */
export function cornerOptics(outerRadiusPx: number, paddingPx: number): number {
  return Math.max(0, outerRadiusPx - paddingPx);
}
