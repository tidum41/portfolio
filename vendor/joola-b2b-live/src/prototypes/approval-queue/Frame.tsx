import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

export function ApprovalFrame({ children }: { children: ReactNode }) {
  return (
    <div className="aq">
      <aside className="aq-side">
        <img className="aq-logo" src="/joola-logo.png" alt="JOOLA" />
        <span className="aq-wholesale">Wholesale</span>
        <nav className="aq-nav" aria-label="Admin">
          <span className="is-active">Approvals</span>
          <span>Replacements</span>
          <span>Accounts</span>
        </nav>
        <a className="aq-store" href="https://www.joola.com">
          Back to joola.com store
        </a>
      </aside>
      <div className="aq-main">
        <header className="aq-top">
          <div className="aq-rep">
            <strong>Collin Johns</strong>
            <span>Sales rep</span>
          </div>
        </header>
        <div className="aq-page">
          <h1>Approval queue</h1>
          <p className="aq-lede">
            Orders over credit limit that need your decision. Select a row to
            approve, or reject when the account cannot cover the order.
          </p>
          <div className="aq-buyer">
            <span>Buyer sees</span>
            <span className="aq-pill aq-pill--pending">Pending approval</span>
            <span>Your rep will need to approve before it ships.</span>
          </div>
          {children}
          <p className="aq-disclaimer">
            Illustrative demo data. Real wholesale figures and client accounts
            cannot be disclosed.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Pills({ why }: { why: ("over-limit" | "overdue")[] }) {
  return (
    <span className={`aq-pills${why.length > 1 ? " is-stack" : ""}`}>
      {why.includes("over-limit") ? (
        <span className="aq-pill aq-pill--over">Over limit</span>
      ) : null}
      {why.includes("overdue") ? (
        <span className="aq-pill aq-pill--due">Overdue invoices</span>
      ) : null}
    </span>
  );
}

const PROTO_STATES = [
  ["default", "Default"],
  ["empty", "Empty queue"],
  ["approve-override", "Approve override"],
  ["reject-with-reason", "Reject reason"],
  ["loading", "Loading"],
] as const;

/** Harness dial. Hidden when `clean=1` so screenshots stay the design. */
export function ProtoStateDial() {
  const [params, setParams] = useSearchParams();
  if (params.get("clean") === "1" || params.get("clean") === "true") return null;
  const current = params.get("protoState") || "default";
  return (
    <div className="proto-state-dial" role="group" aria-label="Force state">
      {PROTO_STATES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          data-active={current === value ? "" : undefined}
          aria-pressed={current === value}
          onClick={() => {
            const next = new URLSearchParams(params);
            if (value === "default") next.delete("protoState");
            else next.set("protoState", value);
            setParams(next, { replace: true });
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function QueueSkeleton() {
  return (
    <div className="aq-skel" aria-busy="true" aria-live="polite">
      <span className="aq-skel__bar" />
      <span className="aq-skel__bar" />
      <span className="aq-skel__bar" />
    </div>
  );
}

export function ActionButton({
  children,
  fill,
  danger,
  busy,
  locked,
  onClick,
}: {
  children: string;
  fill?: boolean;
  danger?: boolean;
  busy?: boolean;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`aq-btn${fill ? " aq-btn--fill" : ""}${danger ? " aq-btn--danger" : ""}`}
      data-busy={busy ? "" : undefined}
      aria-busy={busy || undefined}
      disabled={busy || locked}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span className="aq-btn__label">{children}</span>
    </button>
  );
}

export function Toast({
  message,
  onUndo,
  onDone,
}: {
  message: string;
  onUndo: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 4000);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <div className="aq-toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}
