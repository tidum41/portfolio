import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { HEARTHSIDE_STUDY_SUBTITLE } from "@/lib/dialogue/product/hearthside";

function HeaderPanel({ sub, muted = false }: { sub: string; muted?: boolean }) {
  return (
    <div
      className={["dp-scope-headers__panel", muted ? "dp-scope-headers__panel--muted" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="dp-study-chat__title-row">
        <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
        <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
      </div>
      <p className="dp-study-chat__sub">{sub}</p>
    </div>
  );
}

/** Section 2's figure: the two chat headers only. The per-interview scope,
    muted, beside the study-wide scope the redesign shipped. */
export default function ScopePairFigure() {
  return (
    <div className="dp-scope-headers" data-annotate-part="scope-headers">
      <HeaderPanel sub="Answering questions about this interview" muted />
      <HeaderPanel sub={HEARTHSIDE_STUDY_SUBTITLE} />
    </div>
  );
}
