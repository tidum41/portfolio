"use client";

import JoolaStage from "./JoolaStage";
import { QuickOrderLineInner } from "./JoolaQuickOrderLine";
import { JOOLA_ACCOUNT_CREDIT, money, moneyWhole } from "@/lib/caseStudies/joolaLedger";

/**
 * Solution hero: quick order in the buyer portal shell (search-first).
 */
export default function JoolaQuickOrderHero({ caption }: { caption?: string }) {
  const { limit, available } = JOOLA_ACCOUNT_CREDIT;

  return (
    <JoolaStage
      caption={caption}
      label="Quick order in the wholesale portal"
      className="joola-stage--hero"
    >
      <div className="buyer-shell">
        <header className="buyer-top">
          <div className="buyer-brand">
            <img
              src="/dev/joola-b2b/joola-logo.png"
              alt="JOOLA"
              width={92}
              height={20}
            />
            <span className="buyer-wholesale">Wholesale</span>
          </div>
          <div className="account-chip" aria-label="Dick's Sporting Goods, Anna Bright, Buyer">
            <div className="account-meta">
              <div className="name">Dick&apos;s Sporting Goods</div>
              <div className="role">Anna Bright · Buyer</div>
            </div>
          </div>
        </header>
        <div className="buyer-tabs" role="tablist" aria-label="Buyer navigation">
          <span className="is-active" role="tab" aria-selected>
            Quick order
          </span>
          <span role="tab" aria-selected={false}>
            Catalog
          </span>
          <span role="tab" aria-selected={false}>
            Saved orders
          </span>
        </div>
        <p className="buyer-credit tnum" aria-live="polite">
          {money(available)} left of {moneyWhole(limit)} Net 30 credit
        </p>
        <QuickOrderLineInner initialQty={12} />
      </div>
    </JoolaStage>
  );
}
