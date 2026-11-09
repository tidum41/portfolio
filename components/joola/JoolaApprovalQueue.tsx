"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import JoolaStage from "./JoolaStage";
import { money } from "@/lib/caseStudies/joolaLedger";

type OrderRow = {
  id: string;
  distributor: string;
  so: string;
  buyer: string;
  detail?: string;
  orderTotal: number;
  remaining: number;
  overdue: number;
  overdueInv?: string;
  status: "over" | "ar";
};

const SEED: OrderRow[] = [
  {
    id: "ncs",
    distributor: "North Court Supply",
    so: "SO-48288",
    buyer: "Riley Cho",
    orderTotal: 18447.52,
    remaining: 12250,
    overdue: 0,
    status: "over",
  },
];

function RepChrome({
  active = "Approvals",
  children,
}: {
  active?: "Approvals" | "Replacements" | "Accounts";
  children: ReactNode;
}) {
  return (
    <div className="rep-shell">
      <aside className="rep-sidebar">
        <img className="rep-logo" src="/dev/joola-b2b/joola-logo.png" alt="JOOLA" />
        <span className="rep-wholesale">Wholesale</span>
        <nav className="rep-nav" aria-label="Rep portal">
          {(["Approvals", "Replacements", "Accounts"] as const).map((item) => (
            <span key={item} className={item === active ? "is-active" : undefined}>
              {item}
            </span>
          ))}
        </nav>
        <a className="rep-back" href="https://www.joola.com" tabIndex={-1}>
          Back to joola.com store.
        </a>
      </aside>
      <div className="rep-main">
        <div className="rep-user" aria-label="Signed in as Collin Johns, Sales rep">
          <strong>Collin Johns</strong>
          <span>Sales rep</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function ApprovalQueueInner() {
  const [rows, setRows] = useState(SEED);
  const [modalFor, setModalFor] = useState<OrderRow | null>(null);
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<"approved" | "rejected" | null>(null);
  const [resultRow, setResultRow] = useState<OrderRow | null>(null);
  const [resultReason, setResultReason] = useState("");
  const reasonId = useId();
  const errorId = useId();

  const canApprove = reason.trim().length > 0;

  const overBy = useMemo(() => {
    if (!modalFor) return 0;
    return Math.max(0, modalFor.orderTotal - modalFor.remaining);
  }, [modalFor]);

  function openApprove(row: OrderRow) {
    setModalFor(row);
    setReason("");
    setTried(false);
  }

  function confirmApprove() {
    if (!modalFor) return;
    if (!canApprove) {
      setTried(true);
      return;
    }
    setResultRow(modalFor);
    setResultReason(reason.trim());
    setRows((prev) => prev.filter((r) => r.id !== modalFor.id));
    setModalFor(null);
    setResult("approved");
  }

  function reject(row: OrderRow) {
    setResultRow(row);
    setResultReason("Remaining credit does not cover this order.");
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setResult("rejected");
  }

  function backToQueue() {
    setResult(null);
    setResultRow(null);
    setResultReason("");
    if (rows.length === 0) setRows(SEED);
  }

  if (result && resultRow) {
    const approved = result === "approved";
    return (
      <RepChrome>
        <div className="rep-result">
          <h1>{approved ? "Override approved" : "Order rejected"}</h1>
          <p className="sub">
            {approved
              ? `${resultRow.distributor} can ship ${resultRow.so}.`
              : `${resultRow.so} will not ship.`}
          </p>
          <div
            className={`status-pill${approved ? " is-ok" : " is-rejected"}`}
            style={{ marginTop: 14 }}
          >
            {approved ? "Approved" : "Rejected"}
          </div>
          <div className="card">
            <div className="row">
              <span>Order</span>
              <strong>{resultRow.so}</strong>
            </div>
            <div className="row">
              <span>Distributor</span>
              <strong>{resultRow.distributor}</strong>
            </div>
            <div className="row">
              <span>Buyer</span>
              <strong>{resultRow.buyer}</strong>
            </div>
            <div className="row">
              <span>Total</span>
              <strong>{money(resultRow.orderTotal)}</strong>
            </div>
            <div className="row">
              <span>Reason</span>
              <strong>{resultReason}</strong>
            </div>
            <div className="row">
              <span>{approved ? "Terms" : "Buyer sees"}</span>
              <strong>{approved ? "Net 30" : "Order held"}</strong>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: 20 }} onClick={backToQueue}>
            Back to queue
          </button>
        </div>
      </RepChrome>
    );
  }

  return (
    <RepChrome>
      <h1>Approval queue</h1>
      <p className="rep-lede">Orders over the Net 30 credit limit.</p>
      <div className="rep-banner">
        Buyer sees
        <span className="pending-pill">Pending approval</span>
        Your rep will need to approve before it ships.
      </div>

      {rows.length === 0 ? (
        <div className="rep-empty">No orders are waiting on a credit override.</div>
      ) : (
        <table className="rep-table">
          <thead>
            <tr>
              <th>Distributor</th>
              <th>Order vs remaining credit</th>
              <th>Overdue AR</th>
              <th>Status</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const over = row.orderTotal - row.remaining;
              return (
                <tr key={row.id}>
                  <td className="rep-dist">
                    <strong>{row.distributor}</strong>
                    <div className="sub">
                      {row.so} · {row.buyer}
                      {row.detail ? <div>{row.detail}</div> : null}
                    </div>
                  </td>
                  <td className="rep-credit">
                    <div className="amt">{money(row.orderTotal)}</div>
                    <div className="left">{money(row.remaining)} left</div>
                    <div className={`over${row.status === "ar" ? " is-ar" : ""}`}>
                      Over by {money(over)}
                    </div>
                  </td>
                  <td className={`rep-ar${row.overdue > 0 ? " is-overdue" : ""}`}>
                    {money(row.overdue)}
                    {row.overdueInv ? <span className="inv">{row.overdueInv}</span> : null}
                  </td>
                  <td>
                    <span className={`status-pill is-${row.status}`}>
                      {row.status === "over" ? "Over limit" : "Overdue AR"}
                    </span>
                  </td>
                  <td>
                    <div className="rep-actions">
                      <button type="button" className="btn-primary" onClick={() => openApprove(row)}>
                        Approve
                      </button>
                      <button type="button" className="btn-outline" onClick={() => reject(row)}>
                        Reject
                      </button>
                      <button type="button" className="btn-outline">
                        Request change
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalFor ? (
        <div className="rep-modal-backdrop" role="presentation">
          <div
            className="rep-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={reasonId}
          >
            <h2 id={reasonId}>Approve override</h2>
            <p className="ctx">
              {modalFor.distributor}, {modalFor.so}. This order is over the limit and has no
              overdue AR.
            </p>
            <div className="meter-block">
              <div className="credit-meter-label">
                <span>Net 30 credit</span>
                <span className="avail">
                  {money(modalFor.remaining)} left of $25,000
                </span>
              </div>
              <div
                className="credit-bar"
                data-credit-bar
                style={{ ["--credit-order-end" as string]: "49%" }}
              />
              <div className="over-line">
                Order {money(modalFor.orderTotal)}. Over by {money(overBy)}.
              </div>
            </div>
            <label htmlFor={`${reasonId}-field`}>Reason</label>
            <textarea
              id={`${reasonId}-field`}
              placeholder="Why this order can ship over the limit"
              value={reason}
              aria-invalid={tried && !canApprove}
              aria-describedby={tried && !canApprove ? errorId : undefined}
              onChange={(e) => setReason(e.target.value)}
            />
            {tried && !canApprove ? (
              <div className="field-error" id={errorId} role="alert">
                Required before the override can be saved.
              </div>
            ) : null}
            <div className="rep-modal-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={!canApprove}
                onClick={confirmApprove}
              >
                Approve override
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setModalFor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RepChrome>
  );
}

export default function JoolaApprovalQueue({ caption }: { caption?: string }) {
  return (
    <JoolaStage caption={caption} label="Rep approval queue">
      <ApprovalQueueInner />
    </JoolaStage>
  );
}

export { ApprovalQueueInner, RepChrome };
