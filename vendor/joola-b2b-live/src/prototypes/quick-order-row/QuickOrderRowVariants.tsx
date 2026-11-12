import { useMemo, useState } from "react";
import {
  visibleAvailability,
  LAST_ORDER_QTY,
  lineAmount,
  money,
  type Product,
} from "../../data/ledger";
import { useStore } from "../../state/Store";
import { QtyStepper } from "../../components/ui/primitives";

export type QoRowVariant = "compact" | "reorder" | "stock";

const HERO_IDS = [
  "perseus",
  "hyperion",
  "scorpeus",
  "magnus",
  "hc40",
] as const;

const LEDE: Record<QoRowVariant, string> = {
  compact: "One account price per SKU.",
  reorder: "One account price per SKU. Use last picks your previous quantity.",
  stock: "One account price per SKU.",
};

export function QuickOrderRowVariants({ variant }: { variant: QoRowVariant }) {
  const { products } = useStore();
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const rows = useMemo(
    () =>
      HERO_IDS.map((id) => products[id]).filter((p): p is Product => Boolean(p)),
    [products],
  );

  return (
    <section
      className={`page page--qo qo-row-proto qo-row-proto--${variant}`}
      data-qo-variant={variant}
    >
      <h1>Quick order</h1>
      <p className="page-lede">{LEDE[variant]}</p>

      <div className="qo-table">
        <div className="qo-table__head" aria-hidden>
          <div />
          <div>Product</div>
          <div className="end">Price</div>
          <div>Qty</div>
          <div className="end">Total</div>
        </div>
        {rows.map((p) => {
          const qty = qtys[p.id] ?? 0;
          const total = qty > 0 ? lineAmount(p, qty) : 0;
          const availability = visibleAvailability(p.id);
          const last = LAST_ORDER_QTY[p.id] ?? 0;
          return (
            <div className="qo-table__row" key={p.id}>
              <div className="qo-thumb">
                <img src={p.image} alt="" />
              </div>
              <div className="prod-block">
                <div className="prod-name" title={p.fullName}>
                  {p.fullName}
                </div>
                <div className="prod-sku">SKU {p.sku}</div>
                {availability ? (
                  <div className="prod-sku">{availability}</div>
                ) : null}
              </div>
              <div className="price-block end">
                <div className="unit tnum">
                  {money(p.buyerPrice)}
                  <span className="ea"> ea</span>
                </div>
              </div>
              <div className="qty-cell qo-row-proto__qty">
                <QtyStepper
                  value={qty}
                  onChange={(n) =>
                    setQtys((prev) => ({ ...prev, [p.id]: n }))
                  }
                  moq={p.moq}
                />
                {variant === "reorder" && last > 0 ? (
                  <button
                    type="button"
                    className="qo-use-last"
                    onClick={() =>
                      setQtys((prev) => ({ ...prev, [p.id]: last }))
                    }
                  >
                    Use last ({last.toLocaleString("en-US")})
                  </button>
                ) : null}
              </div>
              <div
                className={`line-total tnum end${qty === 0 ? " is-empty" : ""}`}
              >
                {qty === 0 ? "–" : money(total)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
