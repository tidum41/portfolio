// Hover scale is applied in CSS on `.project-card-lift` (see app/globals.css)
// at 0.98 with the same 90ms-in / 280ms-out timing as the underlay fade.
export const CARD_HOVER_SCALE = 0.98;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
