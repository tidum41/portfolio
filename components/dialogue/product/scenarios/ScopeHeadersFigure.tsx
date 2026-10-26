import { dialogueCopy } from "@/components/dialogue/product/tokens";

/** Round O: the chat's scope change as the two real headers. The
    per-interview header ("Answering questions about this interview", muted)
    beside the study-wide header, both in the chat panel's own header chrome. */
export default function ScopeHeadersFigure() {
  return (
    <div className="dp-scope-headers" data-annotate-part="scope-headers">
      <div className="dp-scope-headers__panel dp-scope-headers__panel--muted">
        <div className="dp-study-chat__title-row">
          <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
          <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
        </div>
        <p className="dp-study-chat__sub dp-scope-headers__line--muted">
          Answering questions about this interview
        </p>
      </div>
      <div className="dp-scope-headers__panel">
        <div className="dp-study-chat__title-row">
          <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
          <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
        </div>
        <p className="dp-study-chat__sub">{dialogueCopy.studySubtitle}</p>
      </div>
    </div>
  );
}
