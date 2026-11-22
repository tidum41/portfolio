import { Fragment, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  lineAmount,
  linesTotal,
  money,
  moneyWhole,
  type ApprovalRow,
} from "../../data/ledger";
import { useStore } from "../../state/Store";
import { useScreenQuery } from "../../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  Modal,
  Skeleton,
  StatusPill,
  SyncBanner,
  Textarea,
} from "../../components/ui/primitives";

type Result = {
  kind: "approved" | "rejected";
  row: ApprovalRow;
  reason: string;
};

type ModalMode = { kind: "approve" | "reject"; row: ApprovalRow };

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function ApprovalQueuePage() {
  const {
    approvals,
    approveOverride,
    rejectOverride,
    restoreApproval,
    products,
  } = useStore();
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => approvals[0]?.id ?? null,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const busy = useRef(false);
  const reasonId = useId();
  const errorId = useId();

  const { status, error, reload, syncing } = useScreenQuery(
    "approvals",
    () => approvals,
    [approvals.length],
  );

  const overBy = useMemo(() => {
    if (!modal) return 0;
    return Math.max(0, modal.row.orderTotal - modal.row.remaining);
  }, [modal]);

  const orderEndPct = useMemo(() => {
    if (!modal) return 0;
    const used = modal.row.creditLimit - modal.row.remaining;
    return Math.min(
      100,
      Math.max(0, ((used + modal.row.orderTotal) / modal.row.creditLimit) * 100),
    );
  }, [modal]);

  function openModal(kind: "approve" | "reject", row: ApprovalRow) {
    setSelectedId(row.id);
    setModal({ kind, row });
    setReason("");
    setTried(false);
  }

  async function confirmModal() {
    if (!modal || busy.current) return;
    if (!reason.trim()) {
      setTried(true);
      return;
    }
    const { kind, row } = modal;
    const why = reason.trim();
    busy.current = true;
    setBusyId(row.id);
    setModal(null);
    try {
      if (kind === "approve") {
        await approveOverride(row.id, why);
        setResult({ kind: "approved", row, reason: why });
        toast.success("Order approved", {
          description: `${row.so} is pending confirmation.`,
          action: {
            label: "Undo",
            onClick: () => {
              restoreApproval(row);
              setResult(null);
              toast.message("Approval undone. Back in the queue.");
            },
          },
        });
      } else {
        await rejectOverride(row.id, why);
        setResult({ kind: "rejected", row, reason: why });
        toast.message("Order rejected", {
          description: `${row.so} will not ship.`,
          action: {
            label: "Undo",
            onClick: () => {
              restoreApproval(row);
              setResult(null);
              toast.message("Rejection undone. Back in the queue.");
            },
          },
        });
      }
    } catch {
      toast.error(
        kind === "approve"
          ? "Could not approve. The order is still in the queue."
          : "Could not reject. The order is still in the queue.",
      );
    } finally {
      busy.current = false;
      setBusyId(null);
    }
  }

  if (result) {
    const approved = result.kind === "approved";
    return (
      <section className="page page--approvals">
        <div className="rep-result">
          <h1>{approved ? "Order approved" : "Order rejected"}</h1>
          <p className="page-lede">
            {approved
              ? `${result.row.so} is pending confirmation.`
              : `${result.row.so} will not ship.`}
          </p>
          <StatusPill tone={approved ? "green" : "danger"}>
            {approved ? "Pending confirmation" : "Rejected"}
          </StatusPill>
          <div className="result-card">
            <div className="row">
              <span>Order</span>
              <strong>{result.row.so}</strong>
            </div>
            <div className="row">
              <span>Account</span>
              <strong>{result.row.distributor}</strong>
            </div>
            <div className="row">
              <span>Reason</span>
              <strong>{result.reason}</strong>
            </div>
          </div>
          <div className="modal__actions" style={{ marginTop: 20 }}>
            <Button
              variant="outline"
              onClick={() => {
                restoreApproval(result.row);
                setResult(null);
                toast.message("Returned to queue");
              }}
            >
              Undo
            </Button>
            <Button variant="primary" onClick={() => setResult(null)}>
              Back to queue
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="page page--approvals">
        <h1>Approval queue</h1>
        <Skeleton rows={4} className="skel--table" />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--approvals">
        <h1>Approval queue</h1>
        <ErrorState
          title="Approvals did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  return (
    <section className="page page--approvals">
      <h1>Approval queue</h1>
      <p className="page-lede">
        Orders over the credit limit. Select a row to approve or reject.
      </p>
      {syncing ? <SyncBanner>Saving approval…</SyncBanner> : null}

      {status === "empty" || approvals.length === 0 ? (
        <EmptyState>No orders need review.</EmptyState>
      ) : (
        <div className="rep-table-wrap">
          <table className="rep-table rep-table--decision">
            <thead>
              <tr>
                <th>Account</th>
                <th>Over by</th>
                <th>Why</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {approvals.map((row) => {
                  const over = Math.max(0, row.orderTotal - row.remaining);
                  const active = selectedId === row.id;
                  const open = openId === row.id;
                  const lineSum = linesTotal(row.lines);
                  const flags: string[] = [];
                  if (row.orderTotal > row.remaining) flags.push("Over limit");
                  if (row.overdue > 0) flags.push("Overdue invoices");
                  return (
                    <Fragment key={row.id}>
                      <motion.tr
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, height: 0, overflow: "hidden" }
                        }
                        transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                        className={active ? "is-selected" : undefined}
                        tabIndex={0}
                        onClick={() => {
                          setSelectedId(row.id);
                          setOpenId(open ? null : row.id);
                        }}
                        onFocus={() => setSelectedId(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedId(row.id);
                            setOpenId(open ? null : row.id);
                          }
                        }}
                        aria-expanded={open}
                        aria-selected={active}
                      >
                        <td className="rep-dist">
                          <strong className="rep-dist__name">
                            {row.distributor}
                          </strong>
                          <div className="sub">
                            {row.so}, {row.buyer}
                          </div>
                        </td>
                        <td className="rep-over">
                          <div className="rep-over__amt is-over-amt tnum">
                            {money(over)}
                          </div>
                          <div className="sub tnum">
                            Order {money(row.orderTotal)}. Credit left{" "}
                            {money(row.remaining)}.
                          </div>
                        </td>
                        <td>
                          <div className="rep-why">
                            <div className="rep-why__pills">
                              {row.orderTotal > row.remaining ? (
                                <StatusPill tone="amber">Over limit</StatusPill>
                              ) : null}
                              {row.overdue > 0 ? (
                                <StatusPill tone="danger">
                                  Overdue {money(row.overdue)}
                                </StatusPill>
                              ) : null}
                            </div>
                            {flags.length === 0 ? (
                              <span className="muted">Needs review</span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="rep-actions">
                            <Button
                              variant={active ? "primary" : "outline"}
                              className={active ? undefined : "rep-approve-idle"}
                              loading={busyId === row.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("approve", row);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("reject", row);
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                      {open ? (
                        <tr className="rep-lines-row">
                          <td colSpan={4}>
                            <div className="rep-lines">
                              {row.lines.map((l) => {
                                const p = products[l.productId];
                                if (!p) return null;
                                return (
                                  <div className="rep-line" key={l.productId}>
                                    <div className="qo-thumb">
                                      <img src={p.image} alt="" />
                                    </div>
                                    <div className="prod-block">
                                      <div className="prod-name">
                                        {p.fullName}
                                      </div>
                                      <div className="prod-sku">
                                        SKU {p.sku}
                                      </div>
                                    </div>
                                    <div className="tpl-unit tnum">
                                      {l.qty} ×{" "}
                                      {money(lineAmount(p, l.qty, l) / l.qty)}
                                    </div>
                                    <div className="tpl-amt tnum">
                                      {money(lineAmount(p, l.qty, l))}
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="rep-lines__sum tnum">
                                Line total {money(lineSum)}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={
          modal?.kind === "reject"
            ? "Reject over-limit order"
            : "Approve over-limit order"
        }
      >
        {modal ? (
          <>
            <p className="modal__ctx">
              {modal.row.distributor}, {modal.row.so}. This order is over the
              Net 30 limit by {money(overBy)}.
              {modal.row.overdue > 0
                ? ` The account has ${money(modal.row.overdue)} in overdue invoices.`
                : " The account has no overdue invoices."}
            </p>
            {modal.kind === "approve" ? (
              <div className="meter-block" style={{ marginTop: 20 }}>
                <div className="credit-meter-label">
                  <span>Net 30 credit</span>
                  <span className="avail">
                    {money(modal.row.remaining)} left of{" "}
                    {moneyWhole(modal.row.creditLimit)}
                  </span>
                </div>
                <div
                  className="credit-bar"
                  data-credit-bar
                  style={{
                    ["--credit-order-end" as string]: `${orderEndPct}%`,
                  }}
                />
              </div>
            ) : null}
            <label
              htmlFor={reasonId}
              style={{ display: "block", marginTop: 18 }}
            >
              {modal.kind === "reject" ? "Rejection reason" : "Approval reason"}
            </label>
            <Textarea
              id={reasonId}
              placeholder={
                modal.kind === "reject"
                  ? "Why this order cannot ship"
                  : "Why you are approving this over-limit order"
              }
              value={reason}
              aria-invalid={tried && !reason.trim()}
              aria-describedby={
                tried && !reason.trim() ? errorId : undefined
              }
              onChange={(e) => setReason(e.target.value)}
            />
            <div
              className="field-error"
              id={errorId}
              role={tried && !reason.trim() ? "alert" : undefined}
              style={{
                minHeight: 16,
                color: "var(--danger)",
                fontSize: 12,
              }}
            >
              {tried && !reason.trim()
                ? modal.kind === "reject"
                  ? "Enter a short reason for the buyer."
                  : "Enter a reason so the buyer knows why this order is approved."
                : "\u00a0"}
            </div>
            <div className="modal__actions">
              <Button
                variant={modal.kind === "reject" ? "danger" : "primary"}
                disabled={!reason.trim()}
                onClick={() => void confirmModal()}
              >
                {modal.kind === "reject" ? "Reject order" : "Approve order"}
              </Button>
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </section>
  );
}

export default ApprovalQueuePage;
