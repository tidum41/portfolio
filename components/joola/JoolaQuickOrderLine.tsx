"use client";

import { useId, useMemo, useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaDemoState, { JoolaSkeleton } from "./JoolaDemoState";
import {
  JOOLA_PRODUCTS,
  lineAmount,
  money,
  nextTier,
  priceAt,
  type JoolaProduct,
} from "@/lib/caseStudies/joolaLedger";

type DemoState =
  | "default"
  | "moq"
  | "oos"
  | "loading"
  | "long-name"
  | "big-qty"
  | "network";

const LONG_NAME =
  "Perseus Pro V Carbon Fiber 16mm Pro Player Edition with Extended Handle";

function StepIcon({ kind }: { kind: "plus" | "minus" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      {kind === "minus" ? (
        <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
      ) : (
        <>
          <rect x="2" y="5.25" width="8" height="1.5" rx="0.5" fill="currentColor" />
          <rect x="5.25" y="2" width="1.5" height="8" rx="0.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

function QuickOrderLineInner({
  mobile = false,
  initialQty = 12,
  productId = "perseus",
  demoState = "default",
}: {
  mobile?: boolean;
  initialQty?: number;
  productId?: keyof typeof JOOLA_PRODUCTS;
  demoState?: DemoState;
}) {
  const base = JOOLA_PRODUCTS[productId];
  const product: JoolaProduct =
    demoState === "long-name"
      ? { ...base, fullName: LONG_NAME, name: LONG_NAME }
      : base;
  const startQty =
    demoState === "moq" ? 0 : demoState === "big-qty" ? 1000000 : initialQty;
  const [qty, setQty] = useState(startQty);
  const [query, setQuery] = useState(demoState === "long-name" ? "Perseus" : "Perseus");
  const errorId = useId();
  const oos = demoState === "oos";
  const belowMoq = !oos && qty > 0 && qty < product.moq;
  const unit = priceAt(product, Math.max(qty, product.moq));
  const total = qty > 0 && !oos ? lineAmount(product, qty) : 0;
  const next = nextTier(product, Math.max(qty, 1));
  const presets = product.presets.slice(0, 3);

  const clampedHint = useMemo(() => {
    if (oos) return "Out of stock. Notify me when back in stock.";
    if (demoState === "network") return "Couldn't update the line. Retry.";
    if (belowMoq) return `Minimum order quantity is ${product.moq}`;
    return null;
  }, [belowMoq, demoState, oos, product.moq]);

  function setSafeQty(n: number) {
    setQty(Math.max(0, Math.min(9999999, Math.round(n))));
  }

  if (demoState === "loading") {
    return <JoolaSkeleton rows={2} />;
  }

  return (
    <div className={`qo-line${mobile ? " is-mobile" : ""}`}>
      <div className="search-row">
        <label className="search-wrap">
          <span className="visually-hidden">Search by name, category, or SKU</span>
          <input
            className="search-field"
            type="search"
            placeholder="Search by name, category, or SKU"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {!mobile ? (
          <button type="button" className="btn-outline btn-upload">
            Upload CSV
          </button>
        ) : null}
      </div>

      <div className="qo-line__table">
        <div className="qo-line__head" aria-hidden={mobile}>
          <div />
          <div>Product</div>
          <div className="end">Price</div>
          <div className="end">Qty</div>
          <div className="end">Total</div>
        </div>
        <div className={`qo-line__row${oos ? " is-oos" : ""}`}>
          <img className="qo-line__thumb" src={product.image} alt="" />
          <div className="prod-block">
            <div className="prod-name" title={product.fullName}>
              {product.fullName}
            </div>
            <div className="prod-sku">SKU {product.sku}</div>
            {oos ? <span className="avail-tag">Out of stock</span> : null}
          </div>
          <div className="price-block end">
            <div className="unit">
              {money(unit)}
              <span className="ea">ea</span>
            </div>
            {next && !oos ? (
              <div className="hint">
                Buy {next.min}+ for <b>{money(next.price)}</b>
                <span className="ea">ea</span>
              </div>
            ) : null}
          </div>
          <div className="qty-cell">
            <div className={`qty-group${belowMoq || demoState === "network" ? " is-error" : ""}`}>
              <div className="qty-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setSafeQty(qty - 1)}
                  disabled={qty <= 0 || oos}
                >
                  <StepIcon kind="minus" />
                </button>
                <input
                  className="qty"
                  inputMode="numeric"
                  aria-label={`${product.name} quantity`}
                  aria-invalid={belowMoq || demoState === "network"}
                  aria-describedby={clampedHint ? errorId : undefined}
                  value={qty}
                  disabled={oos}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    setSafeQty(raw === "" ? 0 : Number(raw));
                  }}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setSafeQty(qty + 1)}
                  disabled={oos}
                >
                  <StepIcon kind="plus" />
                </button>
              </div>
              <div className="qty-presets">
                {presets.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === qty ? "on" : undefined}
                    aria-pressed={n === qty}
                    disabled={oos}
                    onClick={() => setSafeQty(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="moq-error" id={errorId} role={clampedHint ? "alert" : undefined}>
              {clampedHint ?? "\u00a0"}
            </div>
          </div>
          <div className="line-total end tnum">{oos ? "—" : money(total)}</div>
        </div>
      </div>
      {demoState === "network" ? (
        <div className="qo-retry">
          <button type="button" className="btn-outline">
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function JoolaQuickOrderLine({
  caption,
  mobile = false,
}: {
  caption?: string;
  mobile?: boolean;
}) {
  const [demoState, setDemoState] = useState<DemoState>("default");
  return (
    <JoolaStage
      caption={caption}
      mobile={mobile}
      label={mobile ? "Quick Order line on mobile" : "Quick Order line"}
      footer={
        <JoolaDemoState
          value={demoState}
          onChange={(v) => setDemoState(v as DemoState)}
          options={[
            { value: "default", label: "Default" },
            { value: "moq", label: "Below MOQ" },
            { value: "oos", label: "Out of stock" },
            { value: "loading", label: "Loading" },
            { value: "long-name", label: "Long name" },
            { value: "big-qty", label: "Large total" },
            { value: "network", label: "Network error" },
          ]}
        />
      }
    >
      <QuickOrderLineInner
        key={`${demoState}-${mobile ? "m" : "d"}`}
        mobile={mobile}
        demoState={demoState}
      />
    </JoolaStage>
  );
}

export { QuickOrderLineInner };
