import type { VariantId } from "./types";

export const DOCK_VARIANTS: VariantId[] = [
  "dock-xmb-glow",
  "dock-halftone-caret",
  "dock-decode",
  "dock-ps-segment",
  "dock-tooltip",
];

export function isDockVariant(v: VariantId): boolean {
  return DOCK_VARIANTS.includes(v);
}
