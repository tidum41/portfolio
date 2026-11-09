"use client";

import { useState } from "react";
import JoolaStage from "./JoolaStage";
import { JOOLA_PRODUCTS, money } from "@/lib/caseStudies/joolaLedger";

const CARDS = [
  { id: "perseus" as const, chip: "Ordered most" },
  { id: "hyperion" as const, chip: "Your history" },
  { id: "scorpeus" as const, chip: "Also due" },
];

function RecommendedInner({ defaultShowing = true }: { defaultShowing?: boolean }) {
  const [showing, setShowing] = useState(defaultShowing);

  return (
    <div className={`rec-demo${showing ? "" : " is-hidden"}`}>
      <div className="rec-head">
        <div>
          <h3>Recommended for you</h3>
          {showing ? (
            <p className="rec-desc">Based on your orders.</p>
          ) : null}
        </div>
        <button
          type="button"
          className="rec-toggle"
          aria-pressed={showing}
          aria-label={showing ? "Hide recommended" : "Show recommended"}
          onClick={() => setShowing((v) => !v)}
        >
          {showing ? "Showing" : "Hidden"}
        </button>
      </div>
      {showing ? (
        <div className="rec-rail">
          {CARDS.map((card) => {
            const p = JOOLA_PRODUCTS[card.id];
            return (
              <article className="rec-card" key={p.id}>
                <div className="media">
                  <img src={p.image} alt="" />
                </div>
                <span className="chip">{card.chip}</span>
                <div className="title">{p.name}</div>
                <div className="price">{money(p.buyerPrice)}</div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function JoolaRecommended({ caption }: { caption?: string }) {
  return (
    <JoolaStage caption={caption} label="Recommended for you rail">
      <RecommendedInner />
    </JoolaStage>
  );
}

export { RecommendedInner };
