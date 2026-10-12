import PlaceholderMedia from "../shell/PlaceholderMedia";
import { DESCRIPTION, TITLE, applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant } from "./types";

export const D1_LABEL_PAD_X = 12;
export const D1_LABEL_PAD_BOTTOM = 16;

const ASPECT = "4 / 3";
const MEDIA_INDEX = 0;

export type FramedInsetVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  radius: number;
  padding: number;
  gap: number;
  titleSize: number;
  descSize: number;
  labelPadX: number;
  labelPadBottom: number;
};

function innerRadius(v: FramedInsetVariant): number {
  return v.radius - v.padding;
}

function FramedInsetCard({ v }: { v: FramedInsetVariant }) {
  const inner = innerRadius(v);
  return (
    <div
      className="card-lab__frame"
      data-cl-card
      data-cl-kind="framed-inset"
      data-cl-direction="1"
      data-cl-variant={v.id}
      data-cl-radius={v.radius}
      data-cl-padding={v.padding}
      data-cl-inner={inner}
      data-cl-gap={v.gap}
      data-cl-label-pad-x={v.labelPadX}
      data-cl-label-pad-bottom={v.labelPadBottom}
      data-cl-title-size={v.titleSize}
      style={{ borderRadius: `${v.radius}px` }}
    >
      <div
        className="card-lab__frame-media-inset"
        data-cl-media-inset
        style={{ padding: `${v.padding}px ${v.padding}px 0` }}
      >
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={inner}
          className="card-lab__frame-media"
        />
      </div>
      <div
        className="card-lab__frame-copy"
        data-cl-copy
        style={{
          padding: `${v.gap}px ${v.labelPadX}px ${v.labelPadBottom}px`,
        }}
      >
        <p
          className="card-lab__frame-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__frame-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
    </div>
  );
}

export const framedInset: ConceptDefinition<FramedInsetVariant> = {
  id: "framed-inset",
  kind: "framed-inset",
  overrideKey: "d1",
  name: "Framed inset card",
  intent:
    "Media sits inset in a surface frame. Radius stays concentric with the inset.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    {
      id: "a",
      radius: 12,
      padding: 4,
      gap: 12,
      titleSize: 15,
      descSize: 13,
      labelPadX: D1_LABEL_PAD_X,
      labelPadBottom: D1_LABEL_PAD_BOTTOM,
    },
    {
      id: "b",
      radius: 12,
      padding: 8,
      gap: 12,
      titleSize: 15,
      descSize: 13,
      labelPadX: D1_LABEL_PAD_X,
      labelPadBottom: D1_LABEL_PAD_BOTTOM,
    },
    {
      id: "c",
      radius: 16,
      padding: 8,
      gap: 12,
      titleSize: 15,
      descSize: 13,
      labelPadX: D1_LABEL_PAD_X,
      labelPadBottom: D1_LABEL_PAD_BOTTOM,
    },
  ],
  label: (v) =>
    `${v.id} · r ${v.radius} · p ${v.padding} · inner ${innerRadius(v)} · gap ${v.gap} · label ${v.labelPadX}/${v.labelPadBottom} · title ${v.titleSize}`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d1", v.id, v, params, {
      p: "padding",
      r: "radius",
    }),
  render: (v) => <FramedInsetCard v={v} />,
};
