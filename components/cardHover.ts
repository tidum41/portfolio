// Shared hover feel for project cards (both the video-backed and image-backed
// renderers) — a slight press-in scale settling with a slow, heavy, no-bounce
// spring. Damping is just under critical for this stiffness (critical ≈
// 2*sqrt(120) ≈ 21.9), so it settles smoothly with no overshoot rather than
// wobbling — "heavy" comes from the low-ish stiffness taking its time, not
// from any bounce.
export const CARD_HOVER_SCALE = 0.97;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
