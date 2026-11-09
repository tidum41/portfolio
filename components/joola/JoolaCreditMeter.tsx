"use client";

import { useId, useMemo, useState } from "react";
import JoolaStage from "./JoolaStage";
import {
  JOOLA_CREDIT,
  JOOLA_REP_HOLD,
  money,
  moneyWhole,
} from "@/lib/caseStudies/joolaLedger";

function CreditMeterInner({
  initialOrder = 3200,
}: {
  initialOrder?: number;
}) {
  const limit = JOOLA_CREDIT.limit;
  const used = JOOLA_CREDIT.used;
  const remaining = limit - used;
  const [orderTotal, setOrderTotal] = useState(initialOrder);
  const rangeId = useId();

  const after = Math.max(0, remaining - orderTotal);
  const over = orderTotal > remaining;
  const orderEnd = useMemo(() => {
    const end = ((used + orderTotal) / limit) * 100;
    return Math.min(100, Math.max(0, end));
  }, [used, orderTotal, limit]);

  return (
    <div className="credit-demo">
      <div className="credit-meter" data-credit-meter>
        <div className="credit-meter-label">
          <span>Net 30 credit</span>
          <span className="avail">
            {over
              ? `$0.00 left of ${moneyWhole(limit)}`
              : `${money(after)} left of ${moneyWhole(limit)}`}
          </span>
        </div>
        <div
          className="credit-bar"
          data-credit-bar
          style={{ ["--credit-order-end" as string]: `${orderEnd}%` }}
          aria-label={`Net 30 credit: ${money(Math.max(0, remaining - orderTotal))} left of ${moneyWhole(limit)}`}
        />
      </div>

      <div className="credit-order-ctrl">
        <label htmlFor={rangeId}>
          This order · {money(orderTotal)}
          {over ? ` · over by ${money(orderTotal - remaining)}` : ""}
        </label>
        <input
          id={rangeId}
          type="range"
          min={0}
          max={remaining + 4500}
          step={50}
          value={orderTotal}
          onChange={(e) => setOrderTotal(Number(e.target.value))}
        />
      </div>

      {over ? (
        <div className="cart-notice is-warn" role="status">
          <span className="pending-pill">Pending approval</span>
          {JOOLA_REP_HOLD}
        </div>
      ) : null}
    </div>
  );
}

export default function JoolaCreditMeter({ caption }: { caption?: string }) {
  return (
    <JoolaStage caption={caption} label="Net 30 credit meter">
      <CreditMeterInner />
    </JoolaStage>
  );
}

export { CreditMeterInner };
