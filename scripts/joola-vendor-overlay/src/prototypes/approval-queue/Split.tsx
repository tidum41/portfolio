import { money } from "./data";
import {
  ActionButton,
  ApprovalFrame,
  Pills,
  QueueSkeleton,
  Toast,
} from "./Frame";
import { Lines } from "./Ledger";
import { useApprovalQueue } from "./useApprovalQueue";

export function SplitInbox() {
  const queue = useApprovalQueue();
  const current =
    queue.orders.find((order) => order.id === queue.openId) ?? queue.orders[0];
  const invalid = current ? queue.reasonError === current.id : false;

  return (
    <ApprovalFrame>
      {queue.loading ? (
        <QueueSkeleton />
      ) : queue.orders.length === 0 || !current ? (
        <p className="aq-empty">Nothing waiting. The queue is clear.</p>
      ) : (
        <div className="aq-split">
          <div className="aq-list">
            <div className="aq-list__head">{queue.orders.length} waiting</div>
            {queue.orders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`aq-list__row${order.id === current.id ? " is-selected" : ""}`}
                onClick={() => queue.select(order.id)}
              >
                <span className="aq-list__top">
                  <span className="aq-name">{order.account}</span>
                  <span className="aq-list__over tnum">{money(order.overBy)}</span>
                </span>
                <span className="aq-meta">
                  {order.so}, {order.buyer}
                </span>
                <Pills why={order.why} />
              </button>
            ))}
          </div>
          <div className="aq-decision">
            <h2>{current.account}</h2>
            <p className="aq-meta aq-meta--13">
              {current.so}, {current.buyer}
            </p>
            <div className="aq-quad">
              <div>
                <div className="aq-slot__k">Limit</div>
                <div className="aq-quad__v tnum">{money(current.limit)}</div>
              </div>
              <div>
                <div className="aq-slot__k">Credit left</div>
                <div className="aq-quad__v tnum">{money(current.creditLeft)}</div>
              </div>
              <div>
                <div className="aq-slot__k">This order</div>
                <div className="aq-quad__v tnum">{money(current.order)}</div>
              </div>
              <div>
                <div className="aq-slot__k">Over by</div>
                <div className="aq-quad__v tnum is-lg">{money(current.overBy)}</div>
              </div>
              {current.overdue > 0 ? (
                <div>
                  <div className="aq-slot__k">Overdue invoices</div>
                  <div className="aq-quad__v tnum">{money(current.overdue)}</div>
                </div>
              ) : null}
            </div>
            <div className="aq-lines-label">Lines</div>
            <Lines order={current} qtyWidth={48} />
            <label className="aq-reason" htmlFor="split-reason">
              Reason
              <input
                id="split-reason"
                value={queue.reasons[current.id] ?? ""}
                placeholder="Tell the buyer why this order is rejected"
                aria-invalid={invalid || undefined}
                aria-errormessage={invalid ? "split-help" : undefined}
                onChange={(event) =>
                  queue.setReason(current.id, event.target.value)
                }
              />
              <span
                id="split-help"
                className={`aq-help${invalid ? " is-error" : ""}`}
              >
                Required to reject. The buyer sees this note.
              </span>
            </label>
            <div className="aq-decide">
              <ActionButton
                fill
                busy={
                  queue.busyId === current.id && queue.busyKind === "approve"
                }
                locked={queue.busyId === current.id}
                onClick={() => queue.approve(current)}
              >
                Approve
              </ActionButton>
              <ActionButton
                danger={Boolean((queue.reasons[current.id] || "").trim())}
                busy={
                  queue.busyId === current.id && queue.busyKind === "reject"
                }
                locked={queue.busyId === current.id}
                onClick={() => queue.reject(current)}
              >
                Reject
              </ActionButton>
            </div>
          </div>
        </div>
      )}
      {queue.toast ? (
        <Toast
          message={queue.toast.message}
          onUndo={queue.toast.undo}
          onDone={queue.dismissToast}
        />
      ) : null}
    </ApprovalFrame>
  );
}
