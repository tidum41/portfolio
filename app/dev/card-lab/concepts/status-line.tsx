import WireframeMedia from "../shell/WireframeMedia";
import { applyFieldOverrides } from "./tokens";
import { projectById } from "./projects";
import type { ConceptDefinition, ConceptVariant, RenderContext } from "./types";

const ASPECT = "16 / 10";
const PROJECT = projectById("sviz");

export type StatusLineVariant = ConceptVariant & {
  id: "a" | "b" | "c";
  separator: "slash" | "pipe" | "dot";
  linePosition: "under-media" | "under-title" | "on-media";
};

function statusText(sep: StatusLineVariant["separator"]): string {
  const left = "sviz";
  const right = PROJECT.status;
  if (sep === "pipe") return `${left} | ${right}`;
  if (sep === "dot") return `${left} · ${right}`;
  return `${left} / ${right}`;
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
      data-cl-project={PROJECT.id}
    >
      <div className="cl-status__media-wrap" data-cl-media-wrap>
        <WireframeMedia
          kind={PROJECT.wireframe}
          aspect={ASPECT}
          radius={8}
          className="cl-status__media"
          play={force}
        />
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
          {PROJECT.title}
        </p>
        {v.linePosition === "under-title" ? (
          <p className="cl-status__line" data-cl-status-line>
            {status}
          </p>
        ) : null}
        {v.linePosition === "on-media" ? (
          <div className="cl-status__line-spacer" aria-hidden="true" />
        ) : null}
        <p className="cl-status__desc" data-cl-card-desc>
          {PROJECT.subtitle}
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
  mediaIndex: 0,
  variants: [
    { id: "a", separator: "slash", linePosition: "under-media" },
    { id: "b", separator: "pipe", linePosition: "under-title" },
    { id: "c", separator: "dot", linePosition: "on-media" },
  ],
  label: (v) => `${v.id} · ${v.separator} · line ${v.linePosition}`,
  applyOverrides: (v, params) => applyFieldOverrides("d7", v.id, v, params),
  render: (v, ctx) => <StatusLineCard v={v} ctx={ctx} />,
};
