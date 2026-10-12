import PlaceholderMedia from "../shell/PlaceholderMedia";
import { applyFieldOverrides } from "./tokens";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const MEDIA_INDEX = 1;
const TITLE = "JOOLA paddle studio";
const DESC = "Hardware companion for table tennis.";

export type StatusLineVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  separator: "slash" | "pipe" | "dot";
  linePosition: "under-media" | "under-title" | "on-media";
};

function statusText(sep: StatusLineVariant["separator"]): string {
  if (sep === "pipe") return "JOOLA | Shipped 2026";
  if (sep === "dot") return "JOOLA · Shipped 2026";
  return "JOOLA / Shipped 2026";
}

function StatusLineCard({
  v,
  ctx,
}: {
  v: StatusLineVariant;
  ctx?: RenderContext;
}) {
  const force = !!ctx?.forceHover;
  const status = statusText(v.separator);

  return (
    <div
      className="cl-status"
      data-cl-card
      data-cl-kind="status-line"
      data-cl-direction="7"
      data-cl-variant={v.id}
      data-cl-separator={v.separator}
      data-cl-line-pos={v.linePosition}
      data-cl-force-hover={force ? "1" : "0"}
    >
      <div className="cl-status__media-wrap" data-cl-media-wrap>
        <PlaceholderMedia
          aspect={ASPECT}
          mediaIndex={MEDIA_INDEX}
          radius={8}
          className="cl-status__media"
        />
        <span className="cl-status__play" data-cl-play aria-hidden="true" />
        {v.linePosition === "on-media" ? (
          <p className="cl-status__line cl-status__line--on" data-cl-status-line>
            {status}
          </p>
        ) : null}
      </div>
      <div className="cl-status__copy" data-cl-copy>
        {v.linePosition === "under-media" ? (
          <p className="cl-status__line" data-cl-status-line>
            {status}
          </p>
        ) : null}
        <p className="cl-status__title" data-cl-card-title>
          {TITLE}
        </p>
        {v.linePosition === "under-title" ? (
          <p className="cl-status__line" data-cl-status-line>
            {status}
          </p>
        ) : null}
        <p className="cl-status__desc" data-cl-card-desc>
          {DESC}
        </p>
      </div>
    </div>
  );
}

export const statusLine: ConceptDefinition<StatusLineVariant> = {
  id: "status-line",
  kind: "status-line",
  overrideKey: "d7",
  name: "Status line under flush media",
  intent:
    "A spare status line under flush media; hover brightens the frame and shifts the title.",
  aspect: ASPECT,
  mediaIndex: MEDIA_INDEX,
  variants: [
    { id: "a", separator: "slash", linePosition: "under-media" },
    { id: "b", separator: "pipe", linePosition: "under-title" },
    { id: "c", separator: "dot", linePosition: "on-media" },
  ],
  label: (v) => `${v.id} · ${v.separator} · line ${v.linePosition}`,
  applyOverrides: (v, params) => applyFieldOverrides("d7", v.id, v, params),
  render: (v, ctx) => <StatusLineCard v={v} ctx={ctx} />,
};
