import { Link } from "react-router-dom";
import { toast } from "sonner";
import { lineAmount, linesUnits, money } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  QtyStepper,
  Skeleton,
  SyncBanner,
} from "../components/ui/primitives";

export function CartPage() {
  const {
    cart,
    products,
    cartTotal,
    setCartQty,
    removeFromCart,
    restoreCartLine,
    account,
  } = useStore();

  const { status, error, reload, syncing } = useScreenQuery(
    "cart",
    () => cart,
    [cart.length, cartTotal],
  );

  if (status === "loading") {
    return (
      <section className="page page--cart">
        <h1>Cart</h1>
        <Skeleton rows={4} className="skel--table" />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--cart">
        <h1>Cart</h1>
        <ErrorState
          title="Cart did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty" || cart.length === 0) {
    return (
      <section className="page page--cart">
        <h1>Cart</h1>
        <EmptyState>
          Your cart is empty. Add lines from Quick order or Catalog.
        </EmptyState>
        <div style={{ marginTop: 16 }}>
          <Link to="/quick-order" className="btn btn--primary">
            Go to Quick order
          </Link>
        </div>
      </section>
    );
  }

  const remaining = account?.creditRemaining ?? 0;
  const creditAfter = remaining - cartTotal;
  const over = cartTotal > remaining;
  const units = linesUnits(cart);

  return (
    <section className="page page--cart">
      <h1>Cart</h1>
      <p className="page-lede">Review quantities before you place the order.</p>
      {syncing ? <SyncBanner>Updating cart…</SyncBanner> : null}

      <div className="cart-layout">
        <div className="cart-lines">
          <div className="cart-lines__head">
            <span>Product</span>
            <span className="end">Qty</span>
            <span className="end">Total</span>
            <span />
          </div>
          {cart.map((line) => {
            const p = products[line.productId];
            if (!p) return null;
            return (
              <div className="cart-line" key={line.productId}>
                <div className="cart-line__prod">
                  <div className="qo-thumb">
                    <img src={p.image} alt="" />
                  </div>
                  <div>
                    <div className="prod-name">{p.fullName}</div>
                    <div className="prod-sku">
                      SKU {p.sku}, {money(p.buyerPrice)} ea
                    </div>
                  </div>
                </div>
                <QtyStepper
                  value={line.qty}
                  presets={p.presets}
                  moq={p.moq}
                  onChange={(n) => {
                    if (n === 0) removeFromCart(line.productId);
                    else setCartQty(line.productId, n);
                  }}
                />
                <div className="cart-line__amt tnum end">
                  {money(lineAmount(p, line.qty, line))}
                </div>
                <Button
                  variant="ghost"
                  className="btn--danger-text"
                  onClick={() => {
                    const snapshot = { ...line };
                    removeFromCart(line.productId);
                    toast.message(`Removed ${p.name}`, {
                      action: {
                        label: "Undo",
                        onClick: () => {
                          restoreCartLine(snapshot);
                          toast.success(`${p.name} restored`);
                        },
                      },
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="cart-summary__row">
            <span>Lines</span>
            <span className="tnum">{cart.length}</span>
          </div>
          <div className="cart-summary__row">
            <span>Units</span>
            <span className="tnum">{units}</span>
          </div>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span className="tnum">{money(cartTotal)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Credit left after order</span>
            <span className={`tnum${over ? " is-over-amt" : ""}`}>
              {money(creditAfter)}
            </span>
          </div>
          {over ? (
            <p className="cart-notice">
              This order is over your remaining Net 30 credit. Your JOOLA rep
              needs to approve it before a ship date can be confirmed.
            </p>
          ) : null}
          <div className="cart-summary__total">
            <span>Total</span>
            <span className="tnum">{money(cartTotal)}</span>
          </div>
          <Link
            to="/review"
            className="btn btn--primary cart-summary__cta"
          >
            Continue to review
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
