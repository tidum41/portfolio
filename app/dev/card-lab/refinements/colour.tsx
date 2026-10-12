import { applyFieldOverrides } from "../concepts/tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "../concepts/types";
import { RefinementCard } from "./shared";

export type ColourVariant = ConceptVariant & {
  id: string;
  metaColor: string;
  titleColor?: string;
  surface?: string;
  accent?: boolean;
  dark?: boolean;
  note: string;
};

const VARIANTS: ColourVariant[] = [
  {
    id: "C1",
    metaColor: "var(--cl-tertiary)",
    note: "neutral tertiary",
  },
  {
    id: "C2",
    // Warm grey — theme-aware mix so dark canvas still clears 4.5:1.
    metaColor: "color-mix(in srgb, var(--cl-primary) 62%, #c4a574)",
    note: "warm grey",
  },
  {
    id: "C3",
    metaColor: "color-mix(in srgb, var(--cl-primary) 58%, #7a8cab)",
    note: "cool grey",
  },
  {
    id: "C4",
    metaColor: "var(--cl-secondary)",
    note: "soft secondary",
  },
  {
    id: "C5",
    metaColor: "color-mix(in srgb, var(--cl-primary) 72%, transparent)",
    note: "strong meta",
  },
  {
    id: "C6",
    metaColor: "var(--cl-accent)",
    accent: true,
    note: "accent meta",
  },
  {
    id: "C7",
    metaColor: "rgba(242,242,242,0.78)",
    titleColor: "#f2f2f2",
    surface: "#1a1a1a",
    dark: true,
    note: "dark theme",
  },
];

export const refinementColour: ConceptDefinition<ColourVariant> = {
  id: "ref-colour",
  kind: "refinement",
  overrideKey: "rc",
  name: "Refinements · Colour",
  intent:
    "Meta contrast ramps, warm vs cool greys, accent vs none, light and dark — same type size.",
  aspect: "1.2 / 1",
  mediaIndex: 0,
  variants: VARIANTS,
  label: (v) => `${v.id} · ${v.note}`,
  applyOverrides: (v, params) => applyFieldOverrides("rc", v.id, v, params),
  render: (v, ctx?: RenderContext) => (
    <RefinementCard
      id={v.id}
      axis="colour"
      direction={102}
      forceHover={ctx?.forceHover}
      metaColor={v.metaColor}
      titleColor={v.titleColor}
      surface={v.surface}
      accent={v.accent}
      dark={v.dark}
      titleWeight={500}
      metaWeight={400}
      titleSize={18}
      metaSize={13}
    />
  ),
};
