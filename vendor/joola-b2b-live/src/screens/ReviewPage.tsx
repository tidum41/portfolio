import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { money, moneyWhole } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  SyncBanner,
} from "../components/ui/primitives";

export function ReviewPage() {
  const {
    cart,
    cartTotal,
    account,
    customerPo,
    setCustomerPo,
    shipToId,
    setShipToId,
    needBy,
    setNeedBy,
    placeOrder,
    syncing: placing,
  } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const { status, error, reload, syncing } = useScreenQuery(
    "review",
    () => ({ cart, cartTotal }),
    [cart.length, cartTotal],
  );

  const remaining = account?.creditRemaining ?? 0;
  const limit = account?.creditLimit ?? 25000;
  const over = cartTotal > remaining;
  const usedBefore = limit - remaining;
  const orderEndPct = Math.min(
    100,
    Math.max(0, ((usedBefore + cartTotal) / limit) * 100),
  );

  const shipTos = account?.shipTos ?? [];

  const summary = useMemo(
    () => [
      { label: "Lines", value: String(cart.length) },
      { label: "Subtotal", value: money(cartTotal) },
      { label: "Terms", value: "Net 30" },
      { label: "Total", value: money(cartTotal) },
    ],
    [cart.length, cartTotal],
  );

  async function onPlace() {
    if (busy) return;
    setBusy(true);
    const id = toast.loading("Placing order…");
    try {
      const result = await placeOrder();
      toast.success(
        result.needsApproval
          ? "Order submitted for credit approval"
          : "Order placed",
        { id },
      );
      navigate("/order-placed");
    } catch {
      toast.error("Place order failed. Nothing was charged. Try again.", {
        id,
      });
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <section className="page page--review">
        <h1>Review and place order</h1>
        <Skeleton rows={4} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--review">
        <h1>Review and place order</h1>
        <ErrorState
          title="Could not load checkout"
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (cart.length === 0 || status === "empty") {
    return (
      <section className="page page--review">
        <h1>Review and place order</h1>
        <EmptyState>Your cart is empty. Add products before placing.</EmptyState>
        <div style={{ marginTop: 16 }}>
          <Link to="/quick-order" className="btn btn--primary">
            Go to Quick order
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page--review">
      <h1>Review and place order</h1>
      <p className="page-lede">
        Checkout opens on Net 30 and shows the credit in use.
      </p>
      {syncing || placing ? <SyncBanner>Placing order…</SyncBanner> : null}

      <div className="review-grid">
        <div className="review-fields">
          <label>
            Customer PO
            <Input
              value={customerPo}
              onChange={(e) => setCustomerPo(e.target.value)}
              placeholder="e.g. PO-9812"
            />
          </label>
          <label>
            Ship to
            <select
              className="input"
              value={shipToId}
              onChange={(e) => setShipToId(e.target.value)}
            >
              {shipTos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.site} · {s.detail}
                </option>
              ))}
            </select>
          </label>
          <label>
            Need it by
            <Input
              type="date"
              value={needBy}
              onChange={(e) => setNeedBy(e.target.value)}
            />
          </label>

          <div className="credit-meter">
            <div className="credit-meter-label">
              <span>Net 30 credit</span>
              <span className="avail">
                {money(remaining)} left of {moneyWhole(limit)}
              </span>
            </div>
            <div
              className="credit-bar"
              data-credit-bar
              style={{ ["--credit-order-end" as string]: `${orderEndPct}%` }}
            />
            {over ? (
              <p className="cart-notice">
                This order is over your remaining Net 30 credit. Your JOOLA rep
                needs to approve it before it ships.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          {summary.map((row) => (
            <div className="cart-summary__row" key={row.label}>
              <span>{row.label}</span>
              <span className="tnum">{row.value}</span>
            </div>
          ))}
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => void onPlace()}
            style={{ width: "100%", marginTop: 16 }}
          >
            {busy ? "Placing order…" : "Place order"}
          </Button>
          <Link to="/cart" className="btn btn--ghost" style={{ width: "100%", marginTop: 8 }}>
            Back to cart
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default ReviewPage;
