"use client";

import { useState } from "react";
import JoolaStage from "./JoolaStage";
import JoolaDemoState, { JoolaEmpty, JoolaSkeleton } from "./JoolaDemoState";
import { JOOLA_PRODUCTS, money } from "@/lib/caseStudies/joolaLedger";

const CATEGORIES = ["All", "Paddles", "Balls", "Bags", "Apparel"] as const;

const CARDS = [
  { id: "perseus" as const, chip: "Ordered most" },
  { id: "hyperion" as const, chip: "Your history" },
  { id: "scorpeus" as const, chip: "Also due" },
];

type DemoState = "default" | "hidden" | "loading" | "empty";

function RecommendedInner({
  defaultShowing = true,
  demoState = "default",
}: {
  defaultShowing?: boolean;
  demoState?: DemoState;
}) {
  const [showing, setShowing] = useState(
    demoState === "hidden" ? false : defaultShowing,
  );
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Paddles");

  if (demoState === "loading") {
    return (
      <div className="rec-shell">
        <div className="cat-chips" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className={c === "Paddles" ? "on" : undefined} disabled>
              {c}
            </button>
          ))}
        </div>
        <JoolaSkeleton rows={2} />
      </div>
    );
  }

  return (
    <div className={`rec-shell${showing ? "" : " is-hidden"}`}>
      <div className="cat-chips" role="tablist" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            className={c === category ? "on" : undefined}
            aria-selected={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={`rec-demo${showing ? "" : " is-hidden"}`}>
        <div className="rec-head">
          <div className="rec-head__copy">
            <h3>Recommended for you</h3>
            <p className="rec-desc">Based on your orders.</p>
          </div>
          <button
            type="button"
            className="rec-toggle"
            aria-pressed={showing}
            aria-label="Recommended for you"
            onClick={() => setShowing((v) => !v)}
          >
            <span className="rec-toggle__label" data-on={showing ? "true" : "false"}>
              {showing ? "Showing" : "Hidden"}
            </span>
          </button>
        </div>

        <div className="rec-rail-slot" aria-hidden={!showing}>
          {demoState === "empty" ? (
            <JoolaEmpty>No recommendations for this account yet.</JoolaEmpty>
          ) : (
            <div className="rec-rail">
              {CARDS.map((card) => {
                const p = JOOLA_PRODUCTS[card.id];
                return (
                  <article className="rec-card" key={p.id}>
                    <div className="media">
                      <img src={p.image} alt="" />
                    </div>
                    <div className="card-body">
                      <div className="title" title={p.name}>
                        {p.name}
                      </div>
                      <div className="price-row">
                        <span className="price">{money(p.buyerPrice)}</span>
                      </div>
                      <div className="why">{card.chip}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JoolaRecommended({ caption }: { caption?: string }) {
  const [demoState, setDemoState] = useState<DemoState>("default");
  return (
    <JoolaStage
      caption={caption}
      label="Recommended for you rail"
      footer={
        <JoolaDemoState
          value={demoState}
          onChange={(v) => setDemoState(v as DemoState)}
          options={[
            { value: "default", label: "Default" },
            { value: "hidden", label: "Hidden" },
            { value: "loading", label: "Loading" },
            { value: "empty", label: "Empty" },
          ]}
        />
      }
    >
      <RecommendedInner key={demoState} demoState={demoState} />
    </JoolaStage>
  );
}

export { RecommendedInner };
