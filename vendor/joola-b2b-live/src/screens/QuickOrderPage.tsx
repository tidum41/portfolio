import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FULFILLMENT,
  money,
  lineAmount,
} from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  EmptyState,
  ErrorState,
  QtyStepper,
  SearchField,
  Skeleton,
  SyncBanner,
} from "../components/ui/primitives";

export function QuickOrderPage() {
  const { products, addToCart } = useStore();
  const [query, setQuery] = useState("");
  // Qty 0 is the normal untouched default for every row.
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [addErrors, setAddErrors] = useState<Record<string, boolean>>({});

  const { status, error, reload, syncing } = useScreenQuery(
    "quick-order",
    () => Object.values(products),
    [Object.keys(products).join(",")],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Object.values(products);
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        p.sku.includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  const pending = useMemo(() => {
    const ready = matches.filter((p) => (qtys[p.id] ?? 0) >= p.moq);
    const below = matches.filter((p) => {
      const qty = qtys[p.id] ?? 0;
      return qty > 0 && qty < p.moq;
    });
    const lines = ready.length;
    const units = ready.reduce((sum, p) => sum + (qtys[p.id] ?? 0), 0);
    return { ready, below, lines, units };
  }, [matches, qtys]);

  function setQty(id: string, n: number) {
    setQtys((prev) => ({ ...prev, [id]: n }));
    if (n >= (products[id]?.moq ?? 1)) {
      setAddErrors((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  function addSelected() {
    if (pending.below.length > 0) {
      const errs: Record<string, boolean> = {};
      pending.below.forEach((p) => {
        errs[p.id] = true;
      });
      setAddErrors((prev) => ({ ...prev, ...errs }));
    }

    if (pending.ready.length === 0) {
      if (pending.below.length > 0) {
        toast.error("Raise quantities to the minimum before adding.");
      }
      return;
    }

    pending.ready.forEach((p) => addToCart(p.id, qtys[p.id]));
    setAddErrors({});
    setQtys((prev) => {
      const next = { ...prev };
      pending.ready.forEach((p) => {
        next[p.id] = 0;
      });
      return next;
    });
    toast.success(
      pending.ready.length === 1
        ? "Added 1 line to cart"
        : `Added ${pending.ready.length} lines to cart`,
    );
  }

  function footerLabel() {
    if (pending.lines === 0) {
      if (pending.below.length > 0) {
        return "Raise quantities to the minimum";
      }
      return "No quantities set";
    }
    const lineBit =
      pending.lines === 1 ? "Adds 1 line" : `Adds ${pending.lines} lines`;
    const unitBit =
      pending.units === 1 ? "1 unit" : `${pending.units} units`;
    return `${lineBit}, ${unitBit}`;
  }

  if (status === "loading") {
    return (
      <section className="page page--qo">
        <h1>Quick order</h1>
        <Skeleton rows={4} className="skel--table page-skel" />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--qo">
        <h1>Quick order</h1>
        <ErrorState
          title="Products did not load"
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="page page--qo">
        <h1>Quick order</h1>
        <EmptyState>
          No products match this account yet. Ask your JOOLA rep to enable catalog
          access.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="page page--qo">
      <h1>Quick order</h1>
      <p className="page-lede">
        Search by name or SKU, set pack quantities, and add lines to your cart.
      </p>
      {syncing ? <SyncBanner>Saving draft quantities…</SyncBanner> : null}

      <div className="search-row">
        <SearchField value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="outline" className="btn-upload">
          Upload CSV
        </Button>
      </div>

      {matches.length === 0 ? (
        <EmptyState>
          No results for “{query}”. Try a SKU or a shorter product name.
        </EmptyState>
      ) : (
        <div className="qo-table">
          <div className="qo-table__head" aria-hidden>
            <div />
            <div>Product</div>
            <div className="end">Price</div>
            <div>Qty</div>
            <div className="end">Total</div>
          </div>
          {matches.map((p) => {
            const qty = qtys[p.id] ?? 0;
            const total = qty > 0 ? lineAmount(p, qty) : 0;
            const fulfill = FULFILLMENT[p.id];
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
                  {fulfill ? (
                    <span className="avail-tag">
                      {fulfill.warehouse} · {fulfill.availability}
                    </span>
                  ) : null}
                </div>
                <div className="price-block end">
                  <div className="unit tnum">
                    {money(p.buyerPrice)}
                    <span className="ea"> ea</span>
                  </div>
                </div>
                <QtyStepper
                  value={qty}
                  onChange={(n) => setQty(p.id, n)}
                  presets={p.presets}
                  moq={p.moq}
                  error={Boolean(addErrors[p.id])}
                />
                <div
                  className={`line-total tnum end${qty === 0 ? " is-empty" : ""}`}
                >
                  {qty === 0 ? "–" : money(total)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="qo-footer">
        <span
          className={`qo-footer__meta muted${pending.lines === 0 ? " is-waiting" : ""}`}
          aria-live="polite"
        >
          {pending.lines === 0
            ? "Set quantities to enable Add to cart"
            : footerLabel()}
        </span>
        <Button
          variant="primary"
          disabled={pending.lines === 0}
          onClick={addSelected}
        >
          Add to cart
        </Button>
      </div>
    </section>
  );
}

export default QuickOrderPage;
