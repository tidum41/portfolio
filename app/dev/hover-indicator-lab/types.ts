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

export function kindShort(kind: CardKind): string {
  if (kind === "case-study") return "Case study";
  if (kind === "demo") return "Demo";
  return "Case study · Demo";
}
