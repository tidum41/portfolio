"use client";

import { useId, useMemo, useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaDemoState from "./JoolaDemoState";
import {
  JOOLA_CREDIT,
  JOOLA_REP_HOLD,
  money,
  moneyWhole,
} from "@/lib/caseStudies/joolaLedger";

type DemoState = "default" | "over" | "zero" | "payment";

function CreditMeterInner({
  initialOrder = 3200,
  demoState = "default",
}: {
  initialOrder?: number;
  demoState?: DemoState;
}) {
  const limit = JOOLA_CREDIT.limit;
  const used = demoState === "zero" ? limit : JOOLA_CREDIT.used;
  const remaining = Math.max(0, limit - used);
  const start =
    demoState === "over"
      ? remaining + 2500
      : demoState === "zero"
        ? 500
        : initialOrder;
  const [orderTotal, setOrderTotal] = useState(start);
  const rangeId = useId();

  const after = Math.max(0, remaining - orderTotal);
  const over = orderTotal > remaining;
  const orderEnd = useMemo(() => {
    const end = ((used + orderTotal) / limit) * 100;
    return Math.min(100, Math.max(0, end));
  }, [used, orderTotal, limit]);

  const availText = over
    ? `$0.00 left of ${moneyWhole(limit)}`
    : `${money(after)} left of ${moneyWhole(limit)}`;

  return (
    <div className="credit-demo">
      <div className="credit-meter" data-credit-meter>
        <div className="credit-meter-label">
          <span>Net 30 credit</span>
          <span className="avail tnum">{availText}</span>
        </div>
        <div
          className="credit-bar"
          data-credit-bar
          style={{ ["--credit-order-end" as string]: `${orderEnd}%` }}
          aria-label={`Net 30 credit: ${availText}`}
        />
      </div>

      <div className="credit-order-ctrl">
        <label htmlFor={rangeId} className="credit-order-ctrl__label">
          <span className="credit-order-ctrl__key">This order</span>
          <span className="credit-order-ctrl__val tnum">{money(orderTotal)}</span>
          {over ? (
            <span className="credit-over-slot tnum">
              over by {money(orderTotal - remaining)}
            </span>
          ) : null}
        </label>
        <input
          id={rangeId}
          type="range"
          min={0}
          max={Math.max(remaining + 4500, 1000)}
          step={50}
          value={orderTotal}
          onChange={(e) => setOrderTotal(Number(e.target.value))}
        />
      </div>

      <div className="cart-notice-slot" aria-live="polite">
        {demoState === "payment" ? (
          <div className="cart-notice is-error" role="alert">
            Payment failed. Try another card or Net 30.
          </div>
        ) : over ? (
          <div className="cart-notice is-warn" role="status">
            <span className="pending-pill">Pending approval</span>
            {JOOLA_REP_HOLD}
          </div>
        ) : (
          <div className="cart-notice is-placeholder" aria-hidden>
            {"\u00a0"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoolaCreditMeter({ caption }: { caption?: string }) {
  const [demoState, setDemoState] = useState<DemoState>("default");
  return (
    <JoolaStage
      caption={caption}
      label="Net 30 credit meter"
      footer={
        <JoolaDemoState
          value={demoState}
          onChange={(v) => setDemoState(v as DemoState)}
          options={[
            { value: "default", label: "In limit" },
            { value: "over", label: "Over limit" },
            { value: "zero", label: "Zero credit" },
            { value: "payment", label: "Payment failed" },
          ]}
        />
      }
    >
      <CreditMeterInner key={demoState} demoState={demoState} />
    </JoolaStage>
  );
}

export { CreditMeterInner };
