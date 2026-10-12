import { applyFieldOverrides } from "../concepts/tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "../concepts/types";
import { RefinementCard } from "./shared";

export type TypeVariant = ConceptVariant & {
  id: string;
  titleWeight: number;
  metaWeight: number;
  titleSize: number;
  metaSize: number;
  letterSpacing?: string;
  metaFace?: "sans" | "mono" | "smallcaps";
  metaColor?: string;
};

const VARIANTS: TypeVariant[] = [
  {
    id: "T1",
    titleWeight: 500,
    metaWeight: 400,
    titleSize: 18,
    metaSize: 13,
  },
  {
    id: "T2",
    titleWeight: 600,
    metaWeight: 400,
    titleSize: 15,
    metaSize: 13,
  },
  {
    id: "T3",
    titleWeight: 400,
    metaWeight: 400,
    titleSize: 16,
    metaSize: 16,
    metaColor: "var(--cl-tertiary)",
  },
  {
    id: "T4",
    titleWeight: 500,
    metaWeight: 400,
    titleSize: 16,
    metaSize: 14,
    letterSpacing: "-0.01em",
  },
  {
    id: "T5",
    titleWeight: 500,
    metaWeight: 400,
    titleSize: 18,
    metaSize: 13,
    metaFace: "mono",
  },
  {
    id: "T6",
    titleWeight: 500,
    metaWeight: 400,
    titleSize: 18,
    metaSize: 12,
    metaFace: "smallcaps",
  },
];

function label(v: TypeVariant) {
  const face =
    v.metaFace === "mono"
      ? " · mono"
      : v.metaFace === "smallcaps"
        ? " · small-caps"
        : "";
  const ls = v.letterSpacing ? ` · ${v.letterSpacing}` : "";
  return `${v.id} · ${v.titleWeight}/${v.metaWeight} · ${v.titleSize}/${v.metaSize}px${ls}${face}`;
}

export const refinementType: ConceptDefinition<TypeVariant> = {
  id: "ref-type",
  kind: "refinement",
  overrideKey: "rt",
  name: "Refinements · Type",
  intent:
    "Font weight pairings, title size steps, letter-spacing, and meta face — same card, one axis.",
  aspect: "1.2 / 1",
  mediaIndex: 0,
  variants: VARIANTS,
  label,
  applyOverrides: (v, params) => applyFieldOverrides("rt", v.id, v, params),
  render: (v, ctx?: RenderContext) => (
    <RefinementCard
      id={v.id}
      axis="type"
      forceHover={ctx?.forceHover}
      titleWeight={v.titleWeight}
      metaWeight={v.metaWeight}
      titleSize={v.titleSize}
      metaSize={v.metaSize}
      letterSpacing={v.letterSpacing}
      metaFace={v.metaFace}
      metaColor={v.metaColor}
    />
  ),
};
