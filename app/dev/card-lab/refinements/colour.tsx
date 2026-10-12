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
    metaColor: "rgb(99, 99, 94)",
    note: "warm grey",
  },
  {
    id: "C3",
    metaColor: "#8a8f98",
    note: "cool grey",
  },
  {
    id: "C4",
    metaColor: "#999999",
    note: "soft #999",
  },
  {
    id: "C5",
    metaColor: "#5c5c5c",
    note: "strong #5c5c5c",
  },
  {
    id: "C6",
    metaColor: "var(--cl-accent)",
    accent: true,
    note: "accent meta",
  },
  {
    id: "C7",
    metaColor: "rgba(242,242,242,0.55)",
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
      direction={ctx?.direction}
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
