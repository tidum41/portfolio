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

export type VariantId =
  | PillVariantId
  | "dock-tooltip"
  | "cursor-morph"
  | "corner-chip"
  | "inline-subtext";

export const VARIANTS: {
  id: VariantId;
  label: string;
  hint: string;
}[] = [
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
    id: "dock-tooltip",
    label: "macOS Dock tooltip",
    hint: "Top-centre chip fades and rises 4px with a caret.",
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
