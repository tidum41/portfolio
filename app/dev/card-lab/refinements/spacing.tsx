import { applyFieldOverrides } from "../concepts/tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "../concepts/types";
import { RefinementCard } from "./shared";

export type SpacingVariant = ConceptVariant & {
  id: string;
  gap: number;
  inlineMeta?: boolean;
  radius: number;
  border?: boolean;
  insetShadow?: boolean;
  note: string;
};

const VARIANTS: SpacingVariant[] = [
  { id: "S1", gap: 8, radius: 4, note: "gap 8 · radius 4" },
  { id: "S2", gap: 12, radius: 4, note: "gap 12 · radius 4" },
  { id: "S3", gap: 16, radius: 4, note: "gap 16 · radius 4" },
  { id: "S4", gap: 8, radius: 4, inlineMeta: true, note: "inline · year right" },
  { id: "S5", gap: 8, radius: 0, note: "radius 0" },
  { id: "S6", gap: 8, radius: 6, note: "radius 6" },
  { id: "S7", gap: 8, radius: 12, note: "radius 12" },
  { id: "S8", gap: 8, radius: 4, border: true, note: "1px border" },
  { id: "S9", gap: 8, radius: 6, insetShadow: true, note: "subtle inset shadow" },
];

export const refinementSpacing: ConceptDefinition<SpacingVariant> = {
  id: "ref-spacing",
  kind: "refinement",
  overrideKey: "rs",
  name: "Refinements · Spacing & alignment",
  intent:
    "Image→title gap, stacked vs inline year, radius, border vs inset shadow — same type.",
  aspect: "1.2 / 1",
  mediaIndex: 0,
  variants: VARIANTS,
  label: (v) => `${v.id} · ${v.note}`,
  applyOverrides: (v, params) => applyFieldOverrides("rs", v.id, v, params),
  render: (v, ctx?: RenderContext) => (
    <RefinementCard
      id={v.id}
      axis="spacing"
      direction={104}
      forceHover={ctx?.forceHover}
      gap={v.gap}
      inlineMeta={v.inlineMeta}
      radius={v.radius}
      border={v.border}
      insetShadow={v.insetShadow}
      titleWeight={500}
      metaWeight={400}
      titleSize={18}
      metaSize={13}
    />
  ),
};
