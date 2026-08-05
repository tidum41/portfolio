// Hover scale is applied in CSS on `.project-card-lift` (see app/globals.css):
// subtle 0.99 press with a heavier 280/360ms settle.
export const CARD_HOVER_SCALE = 0.99;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
