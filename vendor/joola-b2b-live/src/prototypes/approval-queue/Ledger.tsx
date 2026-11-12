import { money, usedBefore, type QueueOrder } from "./data";
import { ActionButton, Pills, QueueSkeleton, Toast } from "./Frame";
import { useApprovalQueue } from "./useApprovalQueue";

export function Ledger() {
  const queue = useApprovalQueue();

  return (
    <>
      {queue.loading ? (
        <QueueSkeleton />
      ) : queue.orders.length === 0 ? (
        <p className="aq-empty">Nothing waiting. The queue is clear.</p>
      ) : (
        <div className="aq-table" role="table" aria-label="Approval queue">
          <div className="aq-head aq-ledger" role="row">
            <span>Account</span>
            <span>Over by</span>
            <span>Why</span>
            <span>Actions</span>
          </div>
          {queue.orders.map((order) => {
            const open = order.id === queue.openId;
            const invalid = queue.reasonError === order.id;
            return (
              <div
                key={order.id}
                className={`aq-block${open ? " is-open" : ""}`}
              >
                <div
                  className="aq-row aq-ledger"
                  role="row"
                  onClick={() => queue.select(order.id)}
                >
                  <div>
                    <div className="aq-name">{order.account}</div>
                    <div className="aq-meta">
                      {order.so}, {order.buyer}
                    </div>
                  </div>
                  <div className="aq-hero tnum">{money(order.overBy)}</div>
                  <Pills why={order.why} />
                  <div className="aq-actions">
                    <ActionButton
                      fill={open}
                      busy={
                        queue.busyId === order.id && queue.busyKind === "approve"
                      }
                      locked={queue.busyId === order.id}
                      onClick={() => queue.approve(order)}
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      danger={Boolean((queue.reasons[order.id] || "").trim())}
                      busy={
                        queue.busyId === order.id && queue.busyKind === "reject"
                      }
                      locked={queue.busyId === order.id}
                      onClick={() => queue.reject(order)}
                    >
                      Reject
                    </ActionButton>
                  </div>
                </div>
                {open ? (
                  <div className="aq-detail">
                    <div className="aq-math">
                      <Slot label="Limit" value={money(order.limit)} width={120} />
                      <Slot
                        label="Credit left"
                        value={money(order.creditLeft)}
                        width={140}
                      />
                      <Slot
                        label="This order"
                        value={money(order.order)}
                        width={140}
                      />
                      <Slot
                        label="Over by"
                        value={money(order.overBy)}
                        width={120}
                      />
                      <Slot
                        label="Overdue"
                        value={money(order.overdue)}
                        width={100}
                      />
                    </div>
                    <Lines order={order} qtyWidth={48} />
                    <label className="aq-reason" htmlFor={`reason-${order.id}`}>
                      Reason if you reject
                      <input
                        id={`reason-${order.id}`}
                        value={queue.reasons[order.id] ?? ""}
                        placeholder="Short reason for the buyer"
                        aria-invalid={invalid || undefined}
                        aria-errormessage={
                          invalid ? `help-${order.id}` : undefined
                        }
                        onChange={(event) =>
                          queue.setReason(order.id, event.target.value)
                        }
                      />
                      <span
                        id={`help-${order.id}`}
                        className={`aq-help${invalid ? " is-error" : ""}`}
                      >
                        Required to reject.
                      </span>
                    </label>
                    <span className="aq-sr">
                      Used before this order {money(usedBefore(order))}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {queue.toast ? (
        <Toast
          message={queue.toast.message}
          onUndo={queue.toast.undo}
          onDone={queue.dismissToast}
        />
      ) : null}
    </>
  );
}

function Slot({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: number;
}) {
  return (
    <div className="aq-slot" style={{ width }}>
      <div className="aq-slot__k">{label}</div>
      <div className="aq-slot__v tnum">{value}</div>
    </div>
  );
}

export function Lines({
  order,
  qtyWidth,
}: {
  order: QueueOrder;
  qtyWidth: number;
}) {
  return (
    <div className="aq-lines">
      {order.lines.map((line) => (
        <div className="aq-line" key={line.sku}>
          <span>{line.sku}</span>
          <span className="tnum aq-end" style={{ width: qtyWidth }}>
            {line.qty}
          </span>
          <span className="tnum aq-end" style={{ width: 96 }}>
            {money(line.amount)}
          </span>
        </div>
      ))}
      <div className="aq-line aq-line--total">
        <span>Line total</span>
        <span className="tnum aq-end" style={{ width: qtyWidth }} />
        <span className="tnum aq-end" style={{ width: 96 }}>
          {money(order.order)}
        </span>
      </div>
    </div>
  );
}
