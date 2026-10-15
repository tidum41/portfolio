export type CardKind = "case-study" | "demo" | "both";

export type LabProject = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  aspectRatio: string;
  kind: CardKind;
};

export type PillVariantId = "cursor-pill-cherry" | "cursor-pill-icon" | "cursor-pill-compact";

export type DockVariantId =
  | "dock-xmb-glow"
  | "dock-halftone-caret"
  | "dock-decode"
  | "dock-ps-segment"
  | "dock-tooltip";

export type DockPlacementMode = "anchored" | "cursor-follow";

export type VariantId =
  | PillVariantId
  | DockVariantId
  | "cursor-morph"
  | "corner-chip"
  | "inline-subtext";

export const VARIANTS: {
  id: VariantId;
  label: string;
  hint: string;
}[] = [
  {
    id: "dock-xmb-glow",
    label: "Dock · XMB glow line",
    hint: "Frosted chip with a thin horizontal highlight and soft bloom — PS3 menu energy, not macOS chrome.",
  },
  {
    id: "dock-halftone-caret",
    label: "Dock · halftone caret",
    hint: "Same rise/fade; caret is a dot-matrix wedge echoing nav halftone morph.",
  },
  {
    id: "dock-decode",
    label: "Dock · decode type-in",
    hint: "Label resolves from glyphs in ~150ms; ghost width reserved so nothing jumps.",
  },
  {
    id: "dock-ps-segment",
    label: "Dock · PS segment pill",
    hint: "Segmented Case study / Demo with subtle face-button marks on the active side.",
  },
  {
    id: "dock-tooltip",
    label: "macOS Dock tooltip",
    hint: "Top-centre chip fades and rises 4px with a caret (reference).",
  },
  {
    id: "cursor-pill-cherry",
    label: "Cursor pill · Cherry-style",
    hint: "Solid label near the pointer, ~150ms ease-in, slight trail (Cherry Hu–inspired).",
  },
  {
    id: "cursor-pill-icon",
    label: "Cursor pill · icon + offset",
    hint: "14px type, play/arrow icon, more offset from the cursor for readability.",
  },
  {
    id: "cursor-pill-compact",
    label: "Cursor pill · tight follow",
    hint: "Short copy, snappier follow, less lag.",
  },
  {
    id: "cursor-morph",
    label: "Cursor morph",
    hint: "Pointer becomes a circle with action copy.",
  },
  {
    id: "corner-chip",
    label: "Corner chip",
    hint: "Chip slides into the media corner with an arrow.",
  },
  {
    id: "inline-subtext",
    label: "Inline subtext reveal",
    hint: "One line under the title, revealed via clip mask (reserved height).",
  },
];

export function isVariantId(v: string): v is VariantId {
  return VARIANTS.some((x) => x.id === v);
}

export function isPillVariant(v: VariantId): v is PillVariantId {
  return v === "cursor-pill-cherry" || v === "cursor-pill-icon" || v === "cursor-pill-compact";
}

export function kindLabel(kind: CardKind): string {
  if (kind === "case-study") return "View case study";
  if (kind === "demo") return "Play demo";
  return "Case study · Demo";
}

export function kindShort(kind: CardKind): string {
  if (kind === "case-study") return "Case study";
  if (kind === "demo") return "Demo";
  return "Case study · Demo";
}

export function pillCopy(kind: CardKind, variant: PillVariantId): string {
  if (variant === "cursor-pill-compact") {
    if (kind === "case-study") return "Case study";
    if (kind === "demo") return "Demo";
    return "Study · Demo";
  }
  return kindShort(kind);
}
