import { CREDIT_BAR, REP_ORDER } from "./data";

/**
 * The rep's decision panel from the v18 prototype (ApprovalQueuePage: DecisionPanel and
 * DecisionRecord), ported with its markup, copy and tokens. `step` drives the approve loop.
 * Not ported because the loop never reaches it: the lines list, the note field, the confirm step.
 */

export type RepStep =
  | { kind: "idle" }
  | { kind: "focus" }
  | { kind: "typing"; typed: number }
  | { kind: "typed" }
  | { kind: "hover" }
  | { kind: "press" }
  | { kind: "busy" }
  | { kind: "approved" };

const LOGO = "/images/joola/v10/dicks.png";
const LOGO_SIZE = 32;

/** A retailer logo in a white circle with a 1px ring (the prototype's Avatar, wide wordmark fit). */
function Avatar() {
  return (
    <span className="jp-avatar" data-fit="wide" style={{ width: LOGO_SIZE, height: LOGO_SIZE, ["--av" as string]: `${LOGO_SIZE}px` }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- small mock logo inside product UI */}
      <img src={LOGO} alt="" width={LOGO_SIZE} height={LOGO_SIZE} draggable={false} />
    </span>
  );
}

function Title() {
  return (
    <header className="jp-ac-title">
      <Avatar />
      <h2 className="jp-ac-title__name">{REP_ORDER.account}</h2>
      <span className="jp-ac-title__so jp-tnum">{REP_ORDER.so}</span>
    </header>
  );
}

const BAR_STYLE = {
  ["--credit-used" as string]: CREDIT_BAR.used,
  ["--credit-within" as string]: CREDIT_BAR.within,
  ["--credit-over" as string]: CREDIT_BAR.over,
  ["--credit-limit" as string]: CREDIT_BAR.limit,
};

/** The prototype's CreditLegend for an order that goes over the limit. */
const LEGEND = (
  <div className="jp-credit-legend" aria-hidden="true">
    <span className="jp-credit-legend__item is-used"><i />Open invoices <span className="jp-credit-legend__amt jp-tnum">{REP_ORDER.openInvoices}</span></span>
    <span className="jp-credit-legend__item is-order"><i />Covered by credit <span className="jp-credit-legend__amt jp-tnum">{REP_ORDER.covered}</span></span>
    <span className="jp-credit-legend__item is-over"><i />Over the limit <span className="jp-credit-legend__amt jp-tnum">{REP_ORDER.over}</span></span>
    <span className="jp-credit-legend__limit jp-tnum">of {REP_ORDER.limit} limit</span>
  </div>
);

function Facts({ marked }: { marked: boolean }) {
  const r = REP_ORDER;
  return (
    <div className="jp-op-body">
      <div className="jp-ac-sec">
        <div className="jp-ac-key">
          {marked ? <span className="jo-marker jp-rep__mark" aria-hidden="true">1</span> : null}
          <div className="jp-ac-key__label">Over the limit by</div>
          <div className="jp-ac-key__amt jp-tnum is-danger">{r.over}</div>
          <p className="jp-ac-key__sub jp-tnum">{r.order} order, {r.creditLeft} credit left</p>
        </div>
        <section className="jp-ac-info" aria-label="Credit and payment history">
          <div className="jp-rq-credit">
            <div className="jp-credit-bar is-over" role="img" aria-label={`${r.openInvoices} open of ${r.limit}, ${r.over} over the limit`} style={BAR_STYLE} />
            {LEGEND}
          </div>
          <dl className="jp-ac-history">
            <div>
              <dt>Payments</dt>
              <dd><span>{r.payments}</span></dd>
            </div>
          </dl>
          <p className="jp-ac-policy">{r.policy}</p>
        </section>
      </div>
      <div className="jp-ac-lines">
        <div className="jp-ac-lines__bar">
          <span className="jp-tnum">{r.lines}</span>
          <span className="jp-text-link jp-ac-lines__toggle">Show lines</span>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="jp-btn__spinner" aria-hidden="true" />;
}

function DecisionForm({ step, marked }: { step: RepStep; marked: boolean }) {
  const r = REP_ORDER;
  const focused = step.kind === "focus" || step.kind === "typing" || step.kind === "typed" || step.kind === "hover";
  const reason = step.kind === "idle" || step.kind === "focus" ? "" : step.kind === "typing" ? r.reason.slice(0, step.typed) : r.reason;
  // The prototype's quick reasons: all four on focus, then only the ones that still match what is typed.
  const typedLower = reason.trim().toLowerCase();
  const suggestions =
    step.kind === "focus" || step.kind === "typing"
      ? r.quickReasons.filter((q) => !typedLower || (q.toLowerCase().includes(typedLower) && q.toLowerCase() !== typedLower))
      : [];
  const busy = step.kind === "busy";
  return (
    <footer className="jp-op-foot">
      <div className="jp-ac-reason">
        <div className="jp-ac-labelrow">
          <span className="jp-field-label">Reason</span>
          <span className="jp-ac-help">Internal only.</span>
        </div>
        <div className="jp-ac-reasonbox">
          <div className={`jp-input${focused ? " is-focus" : ""}`}>
            {reason ? <span className="jp-input__val">{reason}</span> : <span className="jp-input__ph">{r.placeholder}</span>}
          </div>
          {suggestions.length > 0 ? (
            <ul className="jp-select__list" aria-hidden="true">
              {suggestions.map((q) => (
                <li key={q} className="jp-select__opt">{q}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="jp-ac-type">
        <span className="jp-field-label jp-ac-type__head">Order type</span>
        <div className="jp-ac-radios">
          {r.orderTypes.map((t, i) => (
            <span key={t} className={`jp-ac-radio${i === 0 ? " is-on" : ""}`}><span>{t}</span></span>
          ))}
        </div>
      </div>

      <div className="jp-ac-actions">
        {marked ? <span className="jo-marker jp-rep__mark" aria-hidden="true">2</span> : null}
        <span className="jp-text-link jp-ac-addnote">Add internal note</span>
        <span className={`jp-btn jp-btn--outline jp-btn--busy${busy ? " is-disabled" : ""}`}>
          <span className="jp-btn__face">Reject</span>
        </span>
        <span
          className={`jp-btn jp-btn--primary jp-btn--busy${step.kind === "hover" ? " is-hover" : ""}${step.kind === "press" ? " is-pressed" : ""}${busy ? " is-loading" : ""}`}
        >
          <span className="jp-btn__face">Approve</span>
          <span className="jp-btn__face jp-btn__face--busy"><Spinner /><span>Approving</span></span>
        </span>
      </div>
    </footer>
  );
}

function DecisionRecord() {
  const r = REP_ORDER;
  return (
    <>
      <div className="jp-op-body">
        <div className="jp-ac-done" role="status">
          <h3 className="jp-ac-decision__title jp-ac-done__title">
            <svg className="jp-ac-done__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
            </svg>
            Approved
          </h3>
          <p className="jp-ac-done__next">
            Now pending confirmation. <span className="jp-text-link jp-ac-done__link">View in Orders</span>
          </p>
        </div>
        <section className="jp-ro-intake" aria-label="Decision record">
          <h2 className="jp-ac-decision__title">Decision record</h2>
          <dl className="jp-ro-record">
            <div><dt>Approved by</dt><dd>{r.decidedBy}</dd></div>
            <div><dt>Decided</dt><dd>{r.decidedAt}</dd></div>
            <div><dt>Reason</dt><dd>{r.reason}</dd></div>
            <div><dt>Order type</dt><dd>{r.recordType}</dd></div>
            <div><dt>Over the limit by</dt><dd>{r.over}</dd></div>
          </dl>
        </section>
      </div>
      <footer className="jp-op-foot jp-op-foot--record">
        <div className="jp-ac-actions">
          <span className="jp-btn jp-btn--outline"><span className="jp-btn__face">Undo</span></span>
          <span className="jp-btn jp-btn--primary"><span className="jp-btn__face">Next order</span></span>
        </div>
      </footer>
    </>
  );
}

/** `marked` draws the case study's numbered annotations in the panel's left margin. Not product UI. */
export default function RepDecisionPanel({ step, marked = false }: { step: RepStep; marked?: boolean }) {
  const approved = step.kind === "approved";
  return (
    // Keyed so the record mounts as a new panel and its entry animations run, as in the prototype.
    <div key={approved ? "record" : "decision"} className={`jp-rep${approved ? " is-record" : ""}`} aria-label={`${REP_ORDER.so}, ${REP_ORDER.account}`}>
      <Title />
      {approved ? (
        <DecisionRecord />
      ) : (
        <>
          <Facts marked={marked} />
          <DecisionForm step={step} marked={marked} />
        </>
      )}
    </div>
  );
}
