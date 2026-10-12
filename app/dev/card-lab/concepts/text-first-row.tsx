import PlaceholderMedia from "../shell/PlaceholderMedia";
import { DESCRIPTION, TITLE, applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant } from "./types";

export type PreviewPlacement = "beside" | "above";

const ASPECT = "1.9 / 1";
const MEDIA_INDEX = 2;

export type TextFirstRowVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  hoverMs: number;
  titleSize: number;
  descSize: number;
  rowPadY: number;
  previewWidth: number;
  previewPlacement: PreviewPlacement;
};

function TextFirstRowCard({ v }: { v: TextFirstRowVariant }) {
  return (
    <div
      className="card-lab__text-row"
      data-cl-card
      data-cl-kind="text-row"
      data-cl-direction="3"
      data-cl-variant={v.id}
      data-cl-hover-ms={v.hoverMs}
      data-cl-title-size={v.titleSize}
      data-cl-preview-width={v.previewWidth}
      data-cl-preview-placement={v.previewPlacement}
      data-cl-row-pad-y={v.rowPadY}
      style={{ padding: `${v.rowPadY}px 0` }}
    >
      <div className="card-lab__text-copy" data-cl-copy>
        <p
          className="card-lab__text-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__text-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
      <div
        className="card-lab__preview"
        data-cl-preview
        data-cl-placement={v.previewPlacement}
        style={{
          width: `${v.previewWidth}px`,
          transition: `opacity ${v.hoverMs}ms ease-out, transform ${v.hoverMs}ms ease-out, visibility ${v.hoverMs}ms ease-out`,
        }}
      >
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          className="card-lab__preview-media"
        />
      </div>
    </div>
  );
}

export const textFirstRow: ConceptDefinition<TextFirstRowVariant> = {
  id: "text-first-row",
  kind: "text-row",
  overrideKey: "d3",
  name: "Text-first row",
  intent:
    "Type leads on a borderless row. The media preview fades in on fine pointer and stays inline on touch.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    {
      id: "a",
      hoverMs: 200,
      titleSize: 15,
      descSize: 13,
      rowPadY: 8,
      previewWidth: 160,
      previewPlacement: "beside",
    },
    {
      id: "b",
      hoverMs: 200,
      titleSize: 15,
      descSize: 13,
      rowPadY: 12,
      previewWidth: 200,
      previewPlacement: "beside",
    },
    {
      id: "c",
      hoverMs: 200,
      titleSize: 15,
      descSize: 13,
      rowPadY: 16,
      previewWidth: 180,
      previewPlacement: "above",
    },
  ],
  label: (v) =>
    `${v.id} · preview ${v.previewWidth} ${v.previewPlacement} · pad ${v.rowPadY} · ${v.hoverMs}ms`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d3", v.id, v, params, {
      ms: "hoverMs",
      preview: "previewWidth",
    }),
  render: (v) => <TextFirstRowCard v={v} />,
};
