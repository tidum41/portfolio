export type CardKind = "case-study" | "demo" | "both";

export type LabProject = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  aspectRatio: string;
  kind: CardKind;
};

export type DockPlacementMode = "anchored" | "cursor-follow";

/** Anchored tooltip surface — lab A/B only; cursor-follow unchanged. */
export type AnchoredAppearance = "current" | "refined";

export function kindShort(kind: CardKind): string {
  if (kind === "case-study") return "Case study";
  if (kind === "demo") return "Demo";
  return "Case study · Demo";
}
