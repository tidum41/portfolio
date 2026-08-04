// Shared hover feel for project cards (Mux + image + interactive tiles).
// Heavy press-in spring: low stiffness so it takes its time, damping just
// under critical (≈ 2*sqrt(120) ≈ 21.9) so it settles with no bounce.
export const CARD_HOVER_SCALE = 0.97;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
