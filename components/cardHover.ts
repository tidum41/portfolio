// Hover chrome lives in CSS on `.project-card` (see app/globals.css):
// underlay plate + video wash. No scale — video cards cannot transform
// an ancestor, so none of the cards do.
export const CARD_HOVER_SCALE = 1;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
