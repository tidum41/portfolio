"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import JoolaStage from "./JoolaStage";
import JoolaDemoState, { JoolaSyncBanner } from "./JoolaDemoState";
import { money, moneyWhole } from "@/lib/caseStudies/joolaLedger";

type OrderRow = {
  id: string;
  distributor: string;
  so: string;
  buyer: string;
  detail?: string;
  orderTotal: number;
  remaining: number;
  /** Net 30 credit limit for this account. */
  creditLimit: number;
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
    creditLimit: 25000,
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
        <div className="rep-topbar">
          <div className="rep-user" aria-label="Signed in as Collin Johns, Sales rep">
            <strong>Collin Johns</strong>
            <span>Sales rep</span>
          </div>
        </div>
        <div className="rep-body">{children}</div>
      </div>
    </div>
  );
}

function ApprovalQueueInner({
  forceEmpty = false,
  syncing = false,
  forceResult = null,
}: {
  forceEmpty?: boolean;
  syncing?: boolean;
  forceResult?: "approved" | "rejected" | null;
}) {
  const [rows, setRows] = useState(forceEmpty ? [] : SEED);
  const [modalFor, setModalFor] = useState<OrderRow | null>(null);
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const seed = SEED[0];
  const [result, setResult] = useState<"approved" | "rejected" | null>(forceResult);
  const [resultRow, setResultRow] = useState<OrderRow | null>(
    forceResult ? seed : null,
  );
  const [resultReason, setResultReason] = useState(
    forceResult === "approved"
      ? "Seasonal restock for regional tournament demand."
      : forceResult === "rejected"
        ? "Remaining credit doesn't cover this order."
        : "",
  );
  const reasonId = useId();
  const errorId = useId();

  const canApprove = reason.trim().length > 0;

  const overBy = useMemo(() => {
    if (!modalFor) return 0;
    return Math.max(0, modalFor.orderTotal - modalFor.remaining);
  }, [modalFor]);

  const orderEndPct = useMemo(() => {
    if (!modalFor) return 0;
    const used = modalFor.creditLimit - modalFor.remaining;
    const end = ((used + modalFor.orderTotal) / modalFor.creditLimit) * 100;
    return Math.min(100, Math.max(0, end));
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
    setResultReason("Remaining credit doesn't cover this order.");
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
              : `${resultRow.so} won't ship.`}
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
        The buyer sees:
        <span className="pending-pill">Pending approval</span>
        Your rep will need to approve before it ships.
      </div>

      {syncing ? <JoolaSyncBanner>Syncing with NetSuite…</JoolaSyncBanner> : null}

      {rows.length === 0 ? (
        <div className="rep-empty">No orders are waiting on a credit override.</div>
      ) : (
        <div className="rep-table-wrap">
          <table className="rep-table">
            <thead>
              <tr>
                <th>Distributor</th>
                <th>Order vs remaining credit</th>
                <th>Overdue invoices</th>
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
                        {row.status === "over" ? "Over limit" : "Overdue invoices"}
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
              {modalFor.distributor}, {modalFor.so}. This order is over the Net 30 limit. The
              account has no overdue invoices.
            </p>
            <div className="meter-block">
              <div className="credit-meter-label">
                <span>Net 30 credit</span>
                <span className="avail">
                  {money(modalFor.remaining)} left of {moneyWhole(modalFor.creditLimit)}
                </span>
              </div>
              <div
                className="credit-bar"
                data-credit-bar
                style={{ ["--credit-order-end" as string]: `${orderEndPct}%` }}
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
                Enter a reason to approve this override.
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

type ApprovalDemo = "default" | "empty" | "syncing" | "approved" | "rejected";

export default function JoolaApprovalQueue({ caption }: { caption?: string }) {
  const [demoState, setDemoState] = useState<ApprovalDemo>("default");
  return (
    <JoolaStage
      caption={caption}
      label="Rep approval queue"
      wide
      footer={
        <JoolaDemoState
          value={demoState}
          onChange={(v) => setDemoState(v as ApprovalDemo)}
          options={[
            { value: "default", label: "With order" },
            { value: "empty", label: "Empty queue" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "syncing", label: "Syncing" },
          ]}
        />
      }
    >
      <ApprovalQueueInner
        key={demoState}
        forceEmpty={demoState === "empty"}
        syncing={demoState === "syncing"}
        forceResult={
          demoState === "approved" || demoState === "rejected" ? demoState : null
        }
      />
    </JoolaStage>
  );
}

export { ApprovalQueueInner, RepChrome };
