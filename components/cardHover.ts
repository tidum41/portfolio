// Tokens kept for any JS callers; hover no longer scales cards (grid stays
// optically stable — underlay + Mux wash only).
export const CARD_HOVER_SCALE = 1;
export const CARD_HOVER_SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };
