import { useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
export function ApprovalQueueSection({ children }: { children: ReactNode }) {
  return (
    <section className="page page--approvals aq-proto">
      {children}
    </section>
  );
}

/** @deprecated Use ApprovalQueueSection inside AdminShell. */
export function ApprovalFrame({ children }: { children: ReactNode }) {
  return <ApprovalQueueSection>{children}</ApprovalQueueSection>;
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
