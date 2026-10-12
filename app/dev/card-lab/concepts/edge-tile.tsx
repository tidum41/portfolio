import PlaceholderMedia from "../shell/PlaceholderMedia";
import { DESCRIPTION, TITLE, applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 1;

export type EdgeTileVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  radius: number;
  gutter: number;
  captionGap: number;
  titleSize: number;
  descSize: number;
};

function TileUnit({ v }: { v: EdgeTileVariant }) {
  return (
    <div className="card-lab__tile" data-cl-tile>
      <PlaceholderMedia
        aspect={ASPECT}
        mediaIndex={MEDIA_INDEX}
        radius={v.radius}
        className="card-lab__tile-media"
      />
      <div
        className="card-lab__tile-caption"
        data-cl-copy
        style={{ marginTop: `${v.captionGap}px` }}
      >
        <p
          className="card-lab__tile-title"
          data-cl-card-title
          style={{ fontSize: `${v.titleSize}px` }}
        >
          {TITLE}
        </p>
        <p
          className="card-lab__tile-desc"
          data-cl-card-desc
          style={{ fontSize: `${v.descSize}px` }}
        >
          {DESCRIPTION}
        </p>
      </div>
    </div>
  );
}

function EdgeTileCard({ v }: { v: EdgeTileVariant }) {
  return (
    <div
      data-cl-card
      data-cl-kind="edge-tile"
      data-cl-direction="2"
      data-cl-variant={v.id}
      data-cl-radius={v.radius}
      data-cl-gutter={v.gutter}
      data-cl-gap={v.captionGap}
      data-cl-title-size={v.titleSize}
    >
      <div
        className="card-lab__tile-grid"
        data-cl-tile-grid
        style={{ gap: `${v.gutter}px` }}
      >
        <TileUnit v={v} />
        <TileUnit v={v} />
      </div>
    </div>
  );
}

/** Two captioned tiles share the full column so radius and gutter read at real size. */
export const edgeTile: ConceptDefinition<EdgeTileVariant> = {
  id: "edge-tile",
  kind: "edge-tile",
  overrideKey: "d2",
  name: "Edge-to-edge tile",
  intent:
    "Media is the card. Each tile carries its own caption so gutter and radius stay readable.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    {
      id: "a",
      radius: 8,
      gutter: 8,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
    {
      id: "b",
      radius: 12,
      gutter: 8,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
    {
      id: "c",
      radius: 12,
      gutter: 12,
      captionGap: 8,
      titleSize: 13,
      descSize: 13,
    },
  ],
  label: (v) =>
    `${v.id} · r ${v.radius} · gutter ${v.gutter} · gap ${v.captionGap} · title ${v.titleSize}`,
  applyOverrides: (v, params) =>
    applyFieldOverrides("d2", v.id, v, params, { r: "radius" }),
  render: (v) => <EdgeTileCard v={v} />,
};
