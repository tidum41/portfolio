// Shared hover feel for project cards (Mux + image). Scale is applied via
// CSS on `.project-card-lift` (see app/globals.css) so enter/leave can use
// asymmetric durations — these tokens remain for any JS callers that still
// need the same numbers.
export const CARD_HOVER_SCALE = 1.018;
// Soft settle, no bounce — mirrors the CSS --spring-panel curve timing.
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 280, damping: 28 };
