import { applyFieldOverrides } from "../concepts/tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "../concepts/types";
import { RefinementCard } from "./shared";

export type HoverVariant = ConceptVariant & {
  id: string;
  hover: "arrow" | "underline" | "scale" | "meta-shift";
  note: string;
};

const VARIANTS: HoverVariant[] = [
  { id: "H1", hover: "arrow", note: "arrow nudge +4px" },
  { id: "H2", hover: "underline", note: "title underline" },
  { id: "H3", hover: "scale", note: "image scale 1.02" },
  { id: "H4", hover: "meta-shift", note: "meta colour shift" },
];

export const refinementHover: ConceptDefinition<HoverVariant> = {
  id: "ref-hover",
  kind: "refinement",
  overrideKey: "rh",
  name: "Refinements · Hover detail",
  intent:
    "Small, subtle hover deltas only — arrow, underline, 1.02 image scale, meta colour.",
  aspect: "1.2 / 1",
  mediaIndex: 0,
  variants: VARIANTS,
  label: (v) => `${v.id} · ${v.note}`,
  applyOverrides: (v, params) => applyFieldOverrides("rh", v.id, v, params),
  render: (v, ctx?: RenderContext) => (
    <RefinementCard
      id={v.id}
      axis="hover"
      direction={ctx?.direction}
      forceHover={ctx?.forceHover}
      hover={v.hover}
      titleWeight={500}
      metaWeight={400}
      titleSize={18}
      metaSize={13}
      gap={8}
      radius={4}
    />
  ),
};
