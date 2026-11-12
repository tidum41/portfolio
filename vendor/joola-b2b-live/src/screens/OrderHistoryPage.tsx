import { useState } from "react";
import { toast } from "sonner";
import { lineAmount, money } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
  SyncBanner,
  formatShortDate,
} from "../components/ui/primitives";

export function OrderHistoryPage() {
  const { pastOrders, products, replaceCart } = useStore();
  const [openId, setOpenId] = useState<string | null>(pastOrders[0]?.id ?? null);

  const { status, error, reload, syncing } = useScreenQuery(
    "order-history",
    () => pastOrders,
    [pastOrders.length],
  );

  if (status === "loading") {
    return (
      <section className="page page--orders">
        <h1>Order history</h1>
        <Skeleton rows={4} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--orders">
        <h1>Order history</h1>
        <ErrorState
          title="Could not load orders"
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty" || pastOrders.length === 0) {
    return (
      <section className="page page--orders">
        <h1>Order history</h1>
        <EmptyState>No past orders yet for this account.</EmptyState>
      </section>
    );
  }

  return (
    <section className="page page--orders">
      <h1>Order history</h1>
      <p className="page-lede">Expand a past order to reorder the same lines.</p>
      {syncing ? <SyncBanner /> : null}

      <div className="orders-list">
        {pastOrders.map((order) => {
          const open = openId === order.id;
          return (
            <article key={order.id} className={`order-card${open ? " is-open" : ""}`}>
              <button
                type="button"
                className="order-card__head"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : order.id)}
              >
                <span>
                  <span className="name">{order.label}</span>
                  <span className="meta">
                    {order.id} · {formatShortDate(order.when)}
                  </span>
                </span>
                <span className="order-card__right">
                  <StatusPill
                    tone={
                      order.status.toLowerCase().includes("pending")
                        ? "amber"
                        : "green"
                    }
                  >
                    {order.status}
                  </StatusPill>
                  <span className="tnum">{money(order.total)}</span>
                </span>
              </button>
              {open ? (
                <div className="order-card__body">
                  {order.lines.map((l) => {
                    const p = products[l.productId];
                    if (!p) return null;
                    return (
                      <div className="tpl-line" key={l.productId}>
                        <div className="tpl-thumb">
                          <img src={p.image} alt="" />
                        </div>
                        <div className="prod-block">
                          <div className="prod-name">{p.fullName}</div>
                          <div className="prod-sku">SKU {p.sku}</div>
                        </div>
                        <div className="tpl-unit tnum">{l.qty} units</div>
                        <div className="tpl-amt tnum">
                          {money(lineAmount(p, l.qty, l))}
                        </div>
                      </div>
                    );
                  })}
                  <Button
                    variant="primary"
                    onClick={() => {
                      replaceCart(order.lines);
                      toast.success("Order lines added to cart");
                    }}
                  >
                    Reorder
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default OrderHistoryPage;
