"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  JOOLA_PRODUCTS,
  JOOLA_MESSAGES,
  lineAmount,
  money,
  priceAt,
} from "@/lib/caseStudies/joolaLedger";
import { QuickOrderLineInner } from "../JoolaQuickOrderLine";
import { RecommendedInner } from "../JoolaRecommended";
import { MessagesInner } from "../JoolaMessages";
import "../joola-portal.css";

/** Shared crop frame for cycle stages. */
function Crop({
  children,
  minHeight = 220,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <div className="joola-portal" style={{ minHeight, background: "#fff" }}>
      {children}
    </div>
  );
}

/* ── Recommended rounds ─────────────────────────────────────────── */

export function RecStage({ v }: { v: number }) {
  if (v >= 20) {
    return (
      <Crop minHeight={340}>
        <RecommendedInner />
      </Crop>
    );
  }
  if (v === 18) {
    return (
      <Crop minHeight={340}>
        <div className="rec-demo">
          <div className="rec-head">
            <div>
              <h3>Recommended for you</h3>
              <p className="rec-desc">Based on your orders.</p>
            </div>
            <button type="button" className="rec-toggle" aria-pressed>
              Showing
            </button>
          </div>
          <div className="rec-rail">
            {(["perseus", "hyperion", "scorpeus"] as const).map((id) => {
              const p = JOOLA_PRODUCTS[id];
              return (
                <article className="rec-card" key={id}>
                  <div className="media">
                    <img src={p.image} alt="" />
                  </div>
                  <div className="title">{p.name}</div>
                  <div className="price">{money(p.buyerPrice)}</div>
                </article>
              );
            })}
          </div>
        </div>
      </Crop>
    );
  }
  // Earlier rounds: show rail with longer chips / band evolution via labels
  const chipMap: Record<number, string[]> = {
    5: ["Best seller", "New", "Reorder often"],
    8: ["Paddles", "Paddles", "Paddles"],
    9: ["In stock", "Only 8 left", "Notify me"],
    10: ["You've Ordered This Most", "Try It Out", "Based On Your History"],
    11: ["You've Ordered This Most", "Try It Out", "Based On Your History"],
    12: ["You've Ordered This Most", "Try It Out", "Based On Your History"],
    15: ["Ordered most", "Try it", "Your history"],
    16: ["Ordered most", "Your history", "Also due"],
    19: ["Ordered most", "Your history", "Also due"],
  };
  const chips = chipMap[v] ?? ["Ordered most", "Your history", "Also due"];
  const subtitle =
    v >= 16 ? "The three paddles this restock needs." : v >= 12 ? "Based on your past orders." : null;
  const showToggle = v >= 10;
  const hiddenDesc = v >= 12;

  return (
    <Crop minHeight={340}>
      <div className="rec-demo">
        <div className="rec-head">
          <div>
            <h3>Recommended for you</h3>
            {subtitle && !hiddenDesc ? <p className="rec-desc">{subtitle}</p> : null}
            {v < 16 && v >= 8 && !subtitle ? (
              <p className="rec-desc">Recommendations sit under the category chips.</p>
            ) : null}
          </div>
          {showToggle ? (
            <button type="button" className="rec-toggle" aria-pressed>
              Showing
            </button>
          ) : null}
        </div>
        <div className="rec-rail">
          {(["perseus", "hyperion", "scorpeus"] as const).map((id, i) => {
            const p = JOOLA_PRODUCTS[id];
            return (
              <article className="rec-card" key={id}>
                <div className="media">
                  <img src={p.image} alt="" />
                </div>
                <span className="chip">{chips[i]}</span>
                {v < 20 ? <div className="prod-sku" style={{ margin: "6px 14px 0" }}>Paddles</div> : null}
                <div className="title">{p.name}</div>
                <div className="price">{money(p.buyerPrice)}</div>
              </article>
            );
          })}
        </div>
      </div>
    </Crop>
  );
}

/* ── Product page rounds ────────────────────────────────────────── */

export function ProductPageStage({ v }: { v: number }) {
  if (v === 14) {
    return (
      <Crop minHeight={200}>
        <div style={{ padding: 28, opacity: 0.3 }}>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Product</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 8 }}>Perseus Pro V</div>
          <div style={{ fontSize: 30, fontWeight: 500, marginTop: 16 }}>$149.98</div>
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted)", maxWidth: 360 }}>
            Retired. This fixed-price distributor doesn't need a tiered product page.
          </p>
          <button type="button" className="btn-primary" disabled style={{ marginTop: 16 }}>
            Add to cart
          </button>
        </div>
      </Crop>
    );
  }
  const priceSize = v >= 6 ? 30 : 24;
  return (
    <Crop minHeight={200}>
      <div style={{ padding: 28 }}>
        {v >= 5 ? (
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
            Catalog / Paddles / Perseus Pro V
          </div>
        ) : null}
        <div style={{ fontSize: 22, fontWeight: 500 }}>Perseus Pro V</div>
        <div style={{ fontSize: priceSize, fontWeight: 500, marginTop: 16, fontVariantNumeric: "tabular-nums" }}>
          $149.98 <span style={{ fontSize: 13, color: "var(--faint)", fontWeight: 400 }}>ea</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
          Buy 24+ for <b style={{ color: "var(--ink)" }}>$134.98</b> ea
        </div>
        <button type="button" className="btn-primary" style={{ marginTop: 20 }}>
          Add to cart
        </button>
      </div>
    </Crop>
  );
}

/* ── Identity / wholesale bar ───────────────────────────────────── */

export function IdentityStage({ v }: { v: number }) {
  const retailer =
    v >= 22
      ? "Dick's Sporting Goods"
      : v >= 21
        ? "Courtside Supply"
        : "Baseline Pickleball Co.";
  const person =
    v >= 13 ? "Anna Bright · Buyer" : v >= 10 ? "Patrick Mahomes" : v >= 6 ? "Kevin Love" : null;
  const showTag = v >= 11 && v < 12;
  const showSwitch = v >= 11 && v < 13;
  const cartPill = v >= 11;
  const underline = v >= 21;

  return (
    <Crop minHeight={120}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 20px",
          borderBottom: "1px solid var(--line)",
          flexWrap: "wrap",
        }}
      >
        <img src="/dev/joola-b2b/joola-logo.png" alt="JOOLA" style={{ height: 22, width: "auto" }} />
        {showTag ? <span className="rep-wholesale">Wholesale</span> : null}
        <nav style={{ display: "flex", gap: 16, fontSize: 14, marginLeft: 8 }}>
          {["Quick order", "Catalog", "Saved orders"].map((item, i) => (
            <span
              key={item}
              style={{
                fontWeight: i === 0 ? 500 : 400,
                borderBottom: underline && i === 0 ? "2px solid var(--ink)" : "2px solid transparent",
                paddingBottom: 4,
              }}
            >
              {item}
            </span>
          ))}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {cartPill ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 36,
                padding: "0 12px",
                borderRadius: 8,
                background: v >= 13 ? "transparent" : "#111",
                color: v >= 13 ? "var(--ink)" : "#fff",
                border: v >= 13 ? "1px solid var(--line)" : "0",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Cart
              {v >= 7 && v < 13 ? <span style={{ fontVariantNumeric: "tabular-nums" }}>$4,908.66</span> : null}
            </span>
          ) : (
            <span style={{ fontSize: 13 }}>Bag · 3</span>
          )}
          <span
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: 2,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              fontSize: 13,
              lineHeight: 1.2,
            }}
          >
            <strong style={{ fontWeight: 500 }}>{retailer}</strong>
            {person ? <span style={{ fontSize: 12, color: "var(--muted)" }}>{person}</span> : null}
          </span>
          {showSwitch ? (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Switch to Retail Store</span>
          ) : null}
        </div>
      </div>
    </Crop>
  );
}

/* ── Motion / expand-collapse ───────────────────────────────────── */

export function MotionStage({ v, replayKey = 0 }: { v: number; replayKey?: number }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
    const t = window.setTimeout(() => setOpen(false), 700);
    const t2 = window.setTimeout(() => setOpen(true), 1400);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [v, replayKey]);

  // Instant for v9+; timed for earlier
  const instant = v >= 9;
  const duration =
    v >= 10 ? "120ms" : v === 8 ? "110ms" : v === 7 ? "180ms" : "0ms";

  return (
    <Crop minHeight={200}>
      <div className="tpl-demo">
        <div className={`tpl-card${open ? " is-open" : ""}`}>
          <button
            type="button"
            className="tpl-head"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="tpl-title">
              <span className="name">SO-48213 · Sep restock</span>
              <span className="meta">Placed by Anna Bright</span>
            </span>
            <span className="tpl-total">$4,908.66</span>
            <svg
              className="chev"
              viewBox="0 0 16 16"
              aria-hidden
              style={{
                transition: instant ? "none" : `transform ${duration} cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
            >
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </button>
          <div
            className="tpl-body"
            style={{
              display: open ? "block" : "none",
              transition: instant ? "none" : undefined,
            }}
          >
            <div className="tpl-inner">
              {([
                { id: "perseus" as const, qty: 12 },
                { id: "hyperion" as const, qty: 24 },
              ]).map((l) => {
                const p = JOOLA_PRODUCTS[l.id];
                return (
                  <div className="tpl-line" key={p.id}>
                    <div className="tpl-thumb">
                      <img src={p.image} alt="" />
                    </div>
                    <div>
                      <div className="prod-name">{p.fullName}</div>
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
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)" }}>
          Timing: {instant ? "instant open/close" : `${duration} close`}
        </p>
      </div>
    </Crop>
  );
}

/* ── Quick Order rounds ─────────────────────────────────────────── */

export function QuickOrderStage({ v }: { v: number }) {
  const placeholder =
    v >= 17
      ? "Search by name, category, or SKU"
      : v >= 16
        ? "search by name, category, sku"
        : "Search SKU";
  const showSearchBtn = v === 15;
  const fieldWide = v >= 19;

  return (
    <Crop minHeight={280}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {showSearchBtn ? (
            <button type="button" className="btn-primary" style={{ height: 46, background: "#111" }}>
              Search SKU
            </button>
          ) : null}
          <input
            aria-label="Search"
            placeholder={placeholder}
            defaultValue={v >= 15 ? "600558" : ""}
            style={{
              height: fieldWide ? 46 : 40,
              width: fieldWide ? 420 : 280,
              maxWidth: "100%",
              padding: "0 14px",
              border: "1px solid #DEDEDE",
              borderRadius: 10,
              fontSize: 14,
            }}
          />
          <button
            type="button"
            className="btn-outline"
            style={{ height: fieldWide ? 46 : 40, borderRadius: 10 }}
          >
            Bulk upload
          </button>
          {v >= 19 ? (
            <>
              <button type="button" className="btn-outline" style={{ height: 46, borderRadius: 10 }}>
                Save as template
              </button>
              <button type="button" className="btn-primary" style={{ height: 46 }}>
                Add All To Cart
              </button>
            </>
          ) : null}
        </div>
        <div style={{ marginTop: 16 }}>
          <QuickOrderLineInner initialQty={v >= 9 ? 12 : 4} />
        </div>
        {v >= 6 ? (
          <div
            style={{
              marginTop: 12,
              fontSize: v >= 6 ? 38 : 24,
              fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            }}
          >
            {money(priceAt(JOOLA_PRODUCTS.perseus, 12) * 12)}
          </div>
        ) : null}
      </div>
    </Crop>
  );
}

/* ── Messages rounds ────────────────────────────────────────────── */

export function MessagesStage({ v, replayKey = 0 }: { v: number; replayKey?: number }) {
  if (v >= 21) {
    return (
      <Crop minHeight={300}>
        <MessagesInner replayKey={replayKey} />
      </Crop>
    );
  }
  const title = v >= 18 ? "Message sales" : "JOOLA Sales";
  const showWordmark = v >= 16 && v < 18;
  const sendSize = v >= 19 ? 36 : 20;

  return (
    <Crop minHeight={300}>
      <div className="msg-demo">
        <div className="thread">
          <div className="thread-head">
            {showWordmark ? (
              <img src="/dev/joola-b2b/joola-logo.png" alt="" style={{ height: 18, marginBottom: 6 }} />
            ) : null}
            {title}
            {v >= 15 && v < 18 ? (
              <span className="th-role">Any JOOLA rep can pick this up</span>
            ) : null}
          </div>
          <div className="thread-body">
            <div className="bubble anna">
              <div className="who">
                <b>Anna Bright</b>
                <span>{JOOLA_MESSAGES.annaTime}</span>
              </div>
              {JOOLA_MESSAGES.anna}
            </div>
            <MessagesReply replayKey={replayKey} />
          </div>
          <div className="thread-compose" style={{ display: "flex", gap: 10, padding: "12px 20px", borderTop: "1px solid var(--line)" }}>
            <div className="field" style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid var(--line)", background: "var(--band)", color: "var(--faint)", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 14 }}>
              Write a message
            </div>
            <button
              type="button"
              aria-label="Send"
              style={{
                width: sendSize,
                height: sendSize,
                borderRadius: 999,
                background: "var(--blue)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </Crop>
  );
}

function MessagesReply({ replayKey }: { replayKey: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(t);
  }, [replayKey]);
  if (!show) return null;
  return (
    <div className="bubble sam is-entering">
      <div className="who">
        <b>Collin Johns</b>
        <span>JOOLA Sales · {JOOLA_MESSAGES.samTime}</span>
      </div>
      {JOOLA_MESSAGES.sam}
    </div>
  );
}
