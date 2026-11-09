"use client";

import { useId, useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaDemoState, { JoolaEmpty, JoolaSyncBanner } from "./JoolaDemoState";
import {
  JOOLA_PRODUCTS,
  lineAmount,
  money,
  priceAt,
} from "@/lib/caseStudies/joolaLedger";

const LINES = [
  { productId: "perseus" as const, qty: 12 },
  { productId: "hyperion" as const, qty: 24 },
  { productId: "hc40" as const, qty: 48 },
];

type DemoState = "default" | "empty" | "syncing" | "saved";

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 16 16" aria-hidden="true">
      <polyline points="4 6 8 10 12 6" />
    </svg>
  );
}

function AccountHeader() {
  return (
    <div className="account-chip" aria-label="Dick's Sporting Goods, Anna Bright, Buyer">
      <div className="account-meta">
        <div className="name">Dick&apos;s Sporting Goods</div>
        <div className="role">Anna Bright · Buyer</div>
      </div>
    </div>
  );
}

function SavedOrderInner({
  defaultOpen = true,
  demoState = "default",
}: {
  defaultOpen?: boolean;
  demoState?: DemoState;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const units = LINES.reduce((s, l) => s + l.qty, 0);
  const total = LINES.reduce((s, l) => {
    const p = JOOLA_PRODUCTS[l.productId];
    return s + lineAmount(p, l.qty);
  }, 0);

  return (
    <div className="tpl-demo">
      <div className="account-bar">
        <AccountHeader />
      </div>

      {demoState === "syncing" ? (
        <JoolaSyncBanner>Syncing with NetSuite…</JoolaSyncBanner>
      ) : null}
      {demoState === "saved" ? (
        <JoolaSyncBanner>Saved to NetSuite</JoolaSyncBanner>
      ) : null}

      {demoState === "empty" ? (
        <JoolaEmpty>No saved orders yet. Save a Quick order to create one.</JoolaEmpty>
      ) : (
        <div className={`tpl-card${open ? " is-open" : ""}`}>
          <button
            type="button"
            className="tpl-head"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="tpl-title">
              <span className="name">September restock</span>
              <span className="meta">
                {LINES.length} products, {units} units. Saved by Anna Bright, Sep 12
              </span>
            </span>
            <span className="tpl-total">{money(total)}</span>
            <Chevron />
          </button>
          <div
            className="tpl-body"
            id={panelId}
            role="region"
            aria-hidden={!open}
          >
            <div className="tpl-inner">
              {LINES.map((l) => {
                const p = JOOLA_PRODUCTS[l.productId];
                return (
                  <div className="tpl-line" key={p.id}>
                    <div className="tpl-thumb">
                      <img src={p.image} alt="" />
                    </div>
                    <div className="prod-block">
                      <div className="prod-name" title={p.fullName}>
                        {p.fullName}
                      </div>
                      <div className="prod-sku">SKU {p.sku}</div>
                    </div>
                    <div className="tpl-unit">
                      {l.qty} × {money(priceAt(p, l.qty))}
                    </div>
                    <div className="tpl-amt">{money(lineAmount(p, l.qty))}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoolaSavedOrder({ caption }: { caption?: string }) {
  const [demoState, setDemoState] = useState<DemoState>("default");
  return (
    <JoolaStage
      caption={caption}
      label="Saved order card"
      footer={
        <JoolaDemoState
          value={demoState}
          onChange={(v) => setDemoState(v as DemoState)}
          options={[
            { value: "default", label: "Default" },
            { value: "empty", label: "Empty" },
            { value: "syncing", label: "Syncing" },
            { value: "saved", label: "Saved" },
          ]}
        />
      }
    >
      <SavedOrderInner key={demoState} demoState={demoState} />
    </JoolaStage>
  );
}

export { SavedOrderInner };
