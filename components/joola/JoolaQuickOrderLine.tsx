"use client";

import { useId, useMemo, useState } from "react";
import JoolaStage from "./JoolaStage";
import {
  JOOLA_PRODUCTS,
  lineAmount,
  money,
  nextTier,
  priceAt,
} from "@/lib/caseStudies/joolaLedger";

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
}: {
  mobile?: boolean;
  initialQty?: number;
  productId?: keyof typeof JOOLA_PRODUCTS;
}) {
  const product = JOOLA_PRODUCTS[productId];
  const [qty, setQty] = useState(initialQty);
  const errorId = useId();
  const belowMoq = qty > 0 && qty < product.moq;
  const unit = priceAt(product, Math.max(qty, product.moq));
  const total = qty > 0 ? lineAmount(product, qty) : 0;
  const next = nextTier(product, Math.max(qty, 1));
  const presets = product.presets.slice(0, 3);

  const clampedHint = useMemo(() => {
    if (belowMoq) return `Minimum order quantity is ${product.moq}`;
    return null;
  }, [belowMoq, product.moq]);

  function setSafeQty(n: number) {
    setQty(Math.max(0, Math.min(9999, Math.round(n))));
  }

  return (
    <div className={`qo-line${mobile ? " is-mobile" : ""}`}>
      <div className="qo-line__table">
        <div className="qo-line__head" aria-hidden={mobile}>
          <div />
          <div>Product</div>
          <div className="end">Price</div>
          <div className="end">Qty</div>
          <div className="end">Total</div>
        </div>
        <div className="qo-line__row">
          <img className="qo-line__thumb" src={product.image} alt="" />
          <div>
            <div className="prod-name">{product.fullName}</div>
            <div className="prod-sku">SKU {product.sku}</div>
          </div>
          <div className="price-block end">
            <div className="unit">
              {money(unit)}
              <span className="ea">ea</span>
            </div>
            {next ? (
              <div className="hint">
                Buy {next.min}+ for <b>{money(next.price)}</b>
                <span className="ea">ea</span>
              </div>
            ) : null}
          </div>
          <div className="qty-cell">
            <div className={`qty-group${belowMoq ? " is-error" : ""}`}>
              <div className="qty-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setSafeQty(qty - 1)}
                  disabled={qty <= 0}
                >
                  <StepIcon kind="minus" />
                </button>
                <input
                  className="qty"
                  inputMode="numeric"
                  aria-label={`${product.name} quantity`}
                  aria-invalid={belowMoq}
                  aria-describedby={belowMoq ? errorId : undefined}
                  value={qty}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    setSafeQty(raw === "" ? 0 : Number(raw));
                  }}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setSafeQty(qty + 1)}
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
                    onClick={() => setSafeQty(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {clampedHint ? (
              <div className="moq-error" id={errorId} role="alert">
                {clampedHint}
              </div>
            ) : null}
          </div>
          <div className="line-total end tnum">{money(total)}</div>
        </div>
      </div>
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
  return (
    <JoolaStage
      caption={caption}
      mobile={mobile}
      label={mobile ? "Quick Order line on mobile" : "Quick Order line"}
    >
      <QuickOrderLineInner mobile={mobile} />
    </JoolaStage>
  );
}

export { QuickOrderLineInner };
