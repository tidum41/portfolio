"use client";

import { useMemo, useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaFigureSeg from "./JoolaFigureSeg";
import { ApprovalQueueInner, RepChrome } from "./JoolaApprovalQueue";
import { JOOLA_CREDIT, money, moneyWhole } from "@/lib/caseStudies/joolaLedger";

type InboxView = "split" | "ledger";

const SPLIT_ROWS = [
  {
    distributor: "Dick's Sporting Goods",
    so: "SO-48288",
    buyer: "Maya Okonkwo",
    orderTotal: 18447.52,
    remaining: 12250,
    status: "over" as const,
  },
  {
    distributor: "Baseline Pickleball Co.",
    so: "SO-48301",
    buyer: "Jordan Hale",
    orderTotal: 9620,
    remaining: 4100,
    status: "ar" as const,
  },
  {
    distributor: "Courtside Supply",
    so: "SO-48312",
    buyer: "Sam Rivera",
    orderTotal: 7125,
    remaining: 5200,
    status: "over" as const,
  },
];

function SplitInboxList({ activeSo }: { activeSo: string }) {
  return (
    <ul className="rep-split__list">
      {SPLIT_ROWS.map((r) => (
        <li key={r.so} className={r.so === activeSo ? "is-on" : undefined}>
          <div className="rep-split__dist">{r.distributor}</div>
          <div className="sub">
            {r.so} · {r.buyer}
          </div>
          <span className={`status-pill is-${r.status}`}>
            {r.status === "over" ? "Over limit" : "Overdue invoices"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SplitInboxDemo() {
  const row = SPLIT_ROWS[0];
  const over = row.orderTotal - row.remaining;
  const used = JOOLA_CREDIT.limit - row.remaining;
  const orderEnd = Math.min(100, ((used + row.orderTotal) / JOOLA_CREDIT.limit) * 100);
  const availText = `${money(row.remaining)} left of ${moneyWhole(JOOLA_CREDIT.limit)}`;

  return (
    <RepChrome>
      <div className="rep-split">
        <SplitInboxList activeSo={row.so} />
        <aside className="rep-split__detail" aria-label="Credit math for selected order">
          <h2 className="rep-split__title">{row.distributor}</h2>
          <p className="sub">
            {row.so} · {row.buyer}
          </p>
          <div className="credit-meter" data-credit-meter>
            <div className="credit-meter-label">
              <span>Net 30 credit</span>
              <span className="avail tnum">{availText}</span>
            </div>
            <div
              className="credit-bar"
              data-credit-bar
              style={{ ["--credit-order-end" as string]: `${orderEnd}%` }}
            />
          </div>
          <dl className="rep-split__math">
            <div>
              <dt>Order total</dt>
              <dd className="tnum">{money(row.orderTotal)}</dd>
            </div>
            <div>
              <dt>Remaining credit</dt>
              <dd className="tnum">{money(row.remaining)}</dd>
            </div>
            <div>
              <dt>Over by</dt>
              <dd className="tnum rep-over">{money(over)}</dd>
            </div>
          </dl>
          <div className="rep-actions">
            <button type="button" className="btn-primary">
              Approve
            </button>
            <button type="button" className="btn-outline">
              Reject
            </button>
          </div>
        </aside>
      </div>
    </RepChrome>
  );
}

const SLOT_MIN: Record<InboxView, number> = { split: 420, ledger: 460 };

export default function JoolaApprovalCompare({ caption }: { caption?: string }) {
  const [view, setView] = useState<InboxView>("split");
  const minH = useMemo(() => SLOT_MIN[view], [view]);

  return (
    <JoolaStage
      caption={caption}
      wide
      label="Rep approval queue views"
      footer={
        <JoolaFigureSeg
          label="Approval queue view"
          value={view}
          options={[
            { value: "split", label: "Split inbox" },
            { value: "ledger", label: "Ledger" },
          ]}
          onChange={setView}
        />
      }
    >
      <div className="joola-variant-slot" style={{ minHeight: minH }}>
        {view === "split" ? <SplitInboxDemo /> : <ApprovalQueueInner key="ledger" />}
      </div>
    </JoolaStage>
  );
}
