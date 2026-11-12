import { money, usedBefore } from "./data";
import {
  ActionButton,
  ApprovalFrame,
  Pills,
  QueueSkeleton,
  Toast,
} from "./Frame";
import { Lines } from "./Ledger";
import { useApprovalQueue } from "./useApprovalQueue";

export function Triage() {
  const queue = useApprovalQueue();
  const order = queue.orders[0];

  return (
    <ApprovalFrame>
      {queue.loading ? (
        <QueueSkeleton />
      ) : !order ? (
        <p className="aq-empty">Nothing waiting. The queue is clear.</p>
      ) : (
        <TriageCard queue={queue} order={order} />
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

function TriageCard({
  queue,
  order,
}: {
  queue: ReturnType<typeof useApprovalQueue>;
  order: NonNullable<ReturnType<typeof useApprovalQueue>["orders"][number]>;
}) {
  const used = usedBefore(order);
  const invalid = queue.reasonError === order.id;
  return (
    <>
      <p className="aq-count">1 of {queue.orders.length}</p>
      <article className="aq-card">
        <header className="aq-card__id">
          <div>
            <h2>{order.account}</h2>
            <p>
              {order.so} · {order.buyer}
            </p>
          </div>
          <Pills why={order.why} />
        </header>
        <div className="aq-over-label">Over by</div>
        <div className="aq-over-figure tnum">{money(order.overBy)}</div>
        <div className="aq-credit-label">Credit, limit {money(order.limit)}</div>
        <div
          className="aq-bar"
          role="img"
          aria-label={`Credit used ${money(used)}, room left ${money(order.creditLeft)}, over by ${money(order.overBy)}`}
        >
          <span className="aq-bar__used" style={{ flexGrow: used }} />
          <span className="aq-bar__room" style={{ flexGrow: order.creditLeft }} />
          <span className="aq-bar__over" style={{ flexGrow: order.overBy }} />
        </div>
        <div className="aq-legend">
          <div>
            <div className="aq-slot__k">Used</div>
            <div className="aq-slot__v tnum">{money(used)}</div>
          </div>
          <div>
            <div className="aq-slot__k">Fits in limit</div>
            <div className="aq-slot__v tnum">{money(order.creditLeft)}</div>
          </div>
          <div>
            <div className="aq-slot__k">This order</div>
            <div className="aq-slot__v tnum">{money(order.order)}</div>
          </div>
          <div>
            <div className="aq-slot__k">Over by</div>
            <div className="aq-slot__v tnum">{money(order.overBy)}</div>
          </div>
        </div>
        <p className="aq-caption">Gray is room left. Red is over the limit.</p>
        <Lines order={order} qtyWidth={40} />
        <label className="aq-reason" htmlFor="triage-reason">
          Reason if you reject
          <input
            id="triage-reason"
            value={queue.reasons[order.id] ?? ""}
            placeholder="Short reason for the buyer"
            aria-invalid={invalid || undefined}
            aria-errormessage={invalid ? "triage-help" : undefined}
            onChange={(event) => queue.setReason(order.id, event.target.value)}
          />
        </label>
        <div className="aq-decide">
          <ActionButton
            fill
            busy={queue.busyId === order.id && queue.busyKind === "approve"}
            locked={queue.busyId === order.id}
            onClick={() => queue.approve(order)}
          >
            Approve
          </ActionButton>
          <ActionButton
            danger={Boolean((queue.reasons[order.id] || "").trim())}
            busy={queue.busyId === order.id && queue.busyKind === "reject"}
            locked={queue.busyId === order.id}
            onClick={() => queue.reject(order)}
          >
            Reject
          </ActionButton>
          <span
            id="triage-help"
            className={`aq-help${invalid ? " is-error" : ""}`}
          >
            Required to reject.
          </span>
        </div>
      </article>
    </>
  );
}
