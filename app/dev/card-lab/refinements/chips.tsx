import { applyFieldOverrides } from "../concepts/tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "../concepts/types";
import { RefinementCard, type ChipKind, type ChipPlace } from "./shared";

export type ChipsVariant = ConceptVariant & {
  id: string;
  chip: ChipKind;
  chipPlace: ChipPlace;
  chipRadius: number;
  chipSize: number;
  accent?: boolean;
  note: string;
};

const VARIANTS: ChipsVariant[] = [
  { id: "K0", chip: "none", chipPlace: "below", chipRadius: 4, chipSize: 11, note: "none" },
  { id: "K1", chip: "outline", chipPlace: "below", chipRadius: 4, chipSize: 11, note: "outline · below" },
  { id: "K2", chip: "tint", chipPlace: "below", chipRadius: 4, chipSize: 11, accent: true, note: "filled tint · below" },
  { id: "K3", chip: "mono", chipPlace: "below", chipRadius: 4, chipSize: 11, note: "mono uppercase · below" },
  { id: "K4", chip: "year", chipPlace: "below", chipRadius: 4, chipSize: 11, note: "year chip · below" },
  { id: "K5", chip: "role", chipPlace: "below", chipRadius: 4, chipSize: 11, note: "role chip · below" },
  { id: "K6", chip: "outline", chipPlace: "over", chipRadius: 4, chipSize: 11, note: "outline · over image" },
  { id: "K7", chip: "outline", chipPlace: "below", chipRadius: 4, chipSize: 20, note: "20px · radius 4" },
  { id: "K8", chip: "outline", chipPlace: "below", chipRadius: 99, chipSize: 11, note: "full pill radius" },
];

export const refinementChips: ConceptDefinition<ChipsVariant> = {
  id: "ref-chips",
  kind: "refinement",
  overrideKey: "rk",
  name: "Refinements · Chips",
  intent:
    "Chip presence, style, placement (over image vs below title), and sizing — one axis each.",
  aspect: "1.2 / 1",
  mediaIndex: 0,
  variants: VARIANTS,
  label: (v) => `${v.id} · ${v.note}`,
  applyOverrides: (v, params) => applyFieldOverrides("rk", v.id, v, params),
  render: (v, ctx?: RenderContext) => (
    <RefinementCard
      id={v.id}
      axis="chips"
      forceHover={ctx?.forceHover}
      chip={v.chip}
      chipPlace={v.chipPlace}
      chipRadius={v.chipRadius}
      chipSize={v.chipSize}
      accent={v.accent}
      titleWeight={500}
      metaWeight={400}
      titleSize={18}
      metaSize={13}
      gap={8}
      radius={4}
    />
  ),
};
