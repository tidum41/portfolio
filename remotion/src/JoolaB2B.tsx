import logo from "../assets/joola-b2b/engage-mark.png";
import joolaLogo from "../assets/joola-b2b/joola-logo.png";
import "./joola/fonts";
import { FONT } from "./joola/fonts";
import { money, photos } from "./joola/products";
import { C, EASE_IN_OUT, EASE_OUT, clamp } from "./joola/theme";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import type { CSSProperties } from "react";

export const JOOLA_FPS = 30;
/** 16.0s. Logo, then the order, invoices, and the reply. The loop seam is the cut back to the logo. */
export const JOOLA_DURATION = 480;

/** Laid out at 960×540 and scaled onto 1920×1080. One screen fills the frame. */
const PAGE_W = 960;
const PAGE_H = 540;
const SCALE = 1920 / PAGE_W;
const CHROME = 44;
const PAD = 48;

const QTY = 120;
const SKU = "600558";
const PLACEHOLDER = "Search by name, category, or SKU";
const ANNA = "Perseus Pro V, SKU 600558. When can you restock 120 units?";
const REP = "120 units of Perseus Pro V ship Friday.";

/** Search field is pinned so the caret and the cursor share one coordinate. */
const FIELD_TOP = 214;
const FIELD_H = 46;
const FIELD_LEFT = PAD;
const FIELD_W = 460;

/** A short straight approach, then a 2-frame dip. The pointer stays put between clicks. */
const MOVE = 10;
const DIP = 2;
const NAV_F = 8;
const INTRO = 24;
const QTY_FROM = 12;

const FIELD_AT = INTRO;
const FIELD_ARRIVE = FIELD_AT + MOVE;
const TYPE_AT = INTRO + 14;
const CARET_DROP = TYPE_AT + SKU.length * 2 + 2;
const RESULT_AT = INTRO + 30;
const ROW_AT = INTRO + 42;
const ROW_ARRIVE = ROW_AT + MOVE;
const CUT_REC = INTRO + 100;
const CUT_ORDER = INTRO + 184;
const ADD_AT = INTRO + 190;
const ADD_ARRIVE = ADD_AT + MOVE;
const COUNT_AT = ADD_ARRIVE + DIP;
const COUNT_END = COUNT_AT + 12;
const CUT_INV = INTRO + 286;
const CUT_MSG = INTRO + 360;

const face: CSSProperties = {
  fontFamily: FONT,
  color: C.ink,
  lineHeight: 1.45,
};

const NAV = ["Quick Order", "Catalog", "Invoices", "Messages"] as const;

const PADDLES = [
  {
    src: photos.perseus,
    chip: "Ordered most",
    name: "Perseus Pro V",
    price: 299.95,
    strike: null as number | null,
    sku: "600558",
  },
  {
    src: photos.hyperion,
    chip: "Your history",
    name: "Hyperion Pro IV",
    price: 149.95,
    strike: 229.95,
    sku: "300829",
  },
  {
    src: photos.scorpeus,
    chip: "Also due",
    name: "Scorpeus Pro V",
    price: 299.95,
    strike: null,
    sku: "600567",
  },
].map((paddle) => ({
  ...paddle,
  line: Math.round(paddle.price * QTY * 100) / 100,
}));

const ORDER_TOTAL = Math.round(PADDLES.reduce((sum, paddle) => sum + paddle.line, 0) * 100) / 100;

const BTN_W = 168;
const BTN_H = 46;
const FOOTER_H = 84;
const ADD_LEFT = PAGE_W - PAD - BTN_W;
const ADD_TOP = PAGE_H - FOOTER_H + (FOOTER_H - BTN_H) / 2;

function activeIndex(frame: number) {
  if (frame >= CUT_MSG) return 3;
  if (frame >= CUT_INV) return 2;
  if (frame >= CUT_ORDER) return 0;
  if (frame >= CUT_REC) return 1;
  return 0;
}

/** 12 on the order, then a 12-frame count to 120. Totals use the same number. */
function shownQty(frame: number) {
  if (frame < COUNT_AT) return QTY_FROM;
  const p = interpolate(frame, [COUNT_AT, COUNT_END], [0, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
  return Math.round(QTY_FROM + (QTY - QTY_FROM) * p);
}

/** Underline draws under the destination word only. It never travels across the others. */
function underlineP(frame: number) {
  const cuts = [CUT_REC, CUT_ORDER, CUT_INV, CUT_MSG];
  let at = 0;
  for (const cut of cuts) if (frame >= cut) at = cut;
  if (at === 0) return 1;
  return interpolate(frame, [at, at + NAV_F], [0.28, 1], {
    ...clamp,
    easing: EASE_OUT,
  });
}

function typedCount(frame: number) {
  if (frame < TYPE_AT) return 0;
  return Math.min(SKU.length, Math.floor((frame - TYPE_AT) / 2) + 1);
}

function move(frame: number, start: number, end: number, from: number, to: number) {
  return interpolate(frame, [start, end], [from, to], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
}

function StrokeCheck({ color }: { color: string }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M3.2 8.3 6.3 11.4 12.8 4.6"
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M8 10.25V2.75M8 2.75 5.25 5.5M8 2.75l2.75 2.75"
        fill="none"
        stroke={C.muted}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 10.25v1.5A1.75 1.75 0 0 0 4.5 13.5h7a1.75 1.75 0 0 0 1.75-1.75v-1.5"
        fill="none"
        stroke={C.muted}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pointer({ x, y, dip }: { x: number; y: number; dip: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 8,
        transform: dip ? "translateY(1px)" : undefined,
        pointerEvents: "none",
      }}
    >
      <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.28))" }}>
        <path
          d="M1.4 1.1 1.6 12.6 4.8 9.6 7.4 13.8 9 12.9 6.4 8.7 10.6 8.4Z"
          fill={C.ink}
          stroke="#fff"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Chrome({ frame }: { frame: number }) {
  const active = activeIndex(frame);
  const mark = underlineP(frame);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CHROME,
        zIndex: 3,
        background: C.paper,
        borderBottom: `1px solid ${C.lineStrong}`,
        display: "flex",
        alignItems: "center",
        padding: `0 ${PAD}px`,
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: 32 }}>
        {NAV.map((label, i) => {
          const on = i === active;
          return (
            <div
              key={label}
              style={{
                position: "relative",
                padding: "6px 10px 8px",
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1,
                color: on ? C.ink : C.muted,
                whiteSpace: "nowrap",
              }}
            >
              {label}
              {on ? (
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    bottom: 1,
                    height: 2,
                    borderRadius: 1,
                    background: C.ink,
                    transform: `scaleX(${mark})`,
                    transformOrigin: "left center",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: C.field,
          borderRadius: 99,
          padding: "4px 12px 4px 8px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 99,
            overflow: "hidden",
            background: C.paper,
            flexShrink: 0,
          }}
        >
          <Img src={logo} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>Engage Pickleball</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.faint, whiteSpace: "nowrap" }}>
            Anna Bright · Buyer
          </div>
        </div>
        <svg width={14} height={8} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
          <path d="m2 5 6 6 6-6" fill="none" stroke={C.faint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function SearchScreen({ frame }: { frame: number }) {
  const count = typedCount(frame);
  const typed = SKU.slice(0, count);
  const focused = frame >= FIELD_ARRIVE && frame < CUT_REC;
  const caret = focused && frame < CARET_DROP;
  const show = frame >= RESULT_AT && frame < CUT_REC;
  const added = frame >= ROW_ARRIVE + DIP;
  const p = show
    ? interpolate(frame, [RESULT_AT, RESULT_AT + 10], [0, 1], { ...clamp, easing: EASE_OUT })
    : 0;

  return (
    <div style={{ height: "100%", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: PAD, top: CHROME + 28, right: PAD }}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>Build a bulk order</div>
        <div style={{ marginTop: 8, maxWidth: 560, fontSize: 15, color: C.muted, lineHeight: 1.45 }}>
          Search or upload SKUs to add multiple products and quantities in one view. Pricing reflects
          Engage Pickleball's wholesale tier.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: FIELD_LEFT,
          top: FIELD_TOP,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div style={{ position: "relative", width: FIELD_W, flexShrink: 0 }}>
          <div
            style={{
              height: FIELD_H,
              display: "flex",
              alignItems: "center",
              paddingLeft: 40,
              borderRadius: 10,
              background: C.field,
              fontSize: 15,
              color: focused ? C.ink : C.faint,
            }}
          >
            <span>{focused ? typed : PLACEHOLDER}</span>
            {caret ? (
              <span
                style={{
                  width: 1.5,
                  height: 16,
                  marginLeft: 1,
                  background: C.ink,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            ) : null}
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: 15 }}>
            <circle cx="11" cy="11" r="7" fill="none" stroke={C.faint} strokeWidth={1.75} />
            <path d="m21 21-4.3-4.3" fill="none" stroke={C.faint} strokeWidth={1.75} strokeLinecap="round" />
          </svg>
          {show ? (
            <div
              style={{
                position: "absolute",
                top: FIELD_H + 8,
                left: 0,
                width: FIELD_W,
                padding: 6,
                borderRadius: 10,
                background: C.paper,
                border: `1px solid ${C.lineStrong}`,
                boxShadow: "0 10px 28px rgba(20,20,18,0.14)",
                opacity: p,
                transform: `translateY(${(1 - p) * 12}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 5 }}>
                <Img
                  src={photos.perseus}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 5,
                    objectFit: "cover",
                    background: C.field,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>Perseus Pro V</div>
                  <div style={{ fontSize: 12, color: C.muted }}>SKU 600558 · {money(299.95)} · MOQ 1</div>
                </div>
                {added ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
                    <StrokeCheck color={C.ink} />
                    Added
                  </div>
                ) : (
                  <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block", flexShrink: 0 }}>
                    <path
                      d="M6 3.5 10.5 8 6 12.5"
                      fill="none"
                      stroke={C.faint}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div
          style={{
            height: FIELD_H,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            borderRadius: 10,
            border: `1px solid ${C.lineStrong}`,
            background: C.paper,
            fontSize: 14,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <UploadIcon />
          Bulk upload
        </div>
      </div>
    </div>
  );
}

function RecommendedScreen() {
  return (
    <div style={{ height: "100%", background: C.band, padding: `${CHROME + 22}px ${PAD}px 0`, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>Recommended For You</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 18,
              borderRadius: 99,
              background: C.ink,
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 99,
                background: C.paper,
                position: "absolute",
                left: 2,
                top: 2,
                transform: "translateX(14px)",
              }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Showing</div>
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>Based on your orders.</div>
      <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
        {PADDLES.map((paddle) => (
          <div key={paddle.sku} style={{ width: 268, flexShrink: 0 }}>
            <div
              style={{
                width: 268,
                height: 248,
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
                background: "#F3F3F3",
              }}
            >
              <Img src={paddle.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  padding: "4px 8px",
                  borderRadius: 2,
                  background: C.ink,
                  color: C.paper,
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {paddle.chip}
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{paddle.name}</div>
            <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {money(paddle.price)}
              </span>
              {paddle.strike != null ? (
                <span
                  style={{
                    fontSize: 13,
                    color: C.faint,
                    textDecoration: "line-through",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {money(paddle.strike)}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderScreen({ frame }: { frame: number }) {
  const committed = frame >= COUNT_AT;
  const qty = shownQty(frame);
  const total = Math.round(PADDLES.reduce((sum, paddle) => sum + paddle.price * qty, 0) * 100) / 100;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.paper }}>
      <div style={{ height: CHROME, flexShrink: 0 }} />
      <div style={{ padding: `20px ${PAD}px 0`, flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            padding: "0 0 10px",
            borderBottom: `1.5px solid ${C.ink}`,
          }}
        >
          <div style={{ width: 56, flexShrink: 0 }} />
          <div style={head(true)}>Product</div>
          <div style={{ ...head(false), width: 120 }}>Price</div>
          <div style={{ ...head(false), width: 132, textAlign: "center" }}>Quantity</div>
          <div style={{ ...head(false), width: 128, textAlign: "right" }}>Line total</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
          {PADDLES.map((line, i) => (
            <div
              key={line.sku}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderBottom: i < PADDLES.length - 1 ? `1px solid ${C.line}` : undefined,
              }}
            >
              <Img
                src={line.src}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  background: "#F3F3F3",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{line.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>SKU {line.sku} · MOQ 1</div>
              </div>
              <div style={{ width: 120, flexShrink: 0, textAlign: "left" }}>
                {line.strike != null ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: C.faint,
                      textDecoration: "line-through",
                      lineHeight: 1.2,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {money(line.strike)}
                  </div>
                ) : null}
                <div style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{money(line.price)} ea</div>
              </div>
              <div style={{ width: 132, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 112,
                    height: 40,
                    borderRadius: 10,
                    background: C.field,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: 32, textAlign: "center", fontSize: 16, color: C.muted }}>–</div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {qty}
                  </div>
                  <div style={{ width: 32, textAlign: "center", fontSize: 16, color: C.muted }}>+</div>
                </div>
              </div>
              <div
                style={{
                  width: 128,
                  flexShrink: 0,
                  textAlign: "right",
                  fontSize: 17,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {money(Math.round(line.price * qty * 100) / 100)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          height: FOOTER_H,
          borderTop: `1.5px solid ${C.ink}`,
          boxShadow: "0 -8px 24px rgba(20,20,18,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: `0 ${PAD}px`,
          background: C.paper,
          position: "relative",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1 }}>3 lines</div>
          <div
            style={{
              marginTop: 4,
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              minHeight: 36,
            }}
          >
            {money(total)}
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            marginRight: BTN_W + 8,
            height: BTN_H,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderRadius: 6,
            border: `1.5px solid ${C.ink}`,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Save as template
        </div>
        <div
          style={{
            position: "absolute",
            left: ADD_LEFT,
            top: (FOOTER_H - BTN_H) / 2,
            width: BTN_W,
            height: BTN_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderRadius: 6,
            background: C.black,
            color: C.buttonText,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {committed ? (
            <>
              <StrokeCheck color={C.buttonText} />
              Added
            </>
          ) : (
            "Add All To Cart"
          )}
        </div>
      </div>
    </div>
  );
}

function head(grow: boolean): CSSProperties {
  return {
    flex: grow ? 1 : undefined,
    minWidth: grow ? 0 : undefined,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: C.muted,
    lineHeight: 1.2,
    textAlign: "left",
  };
}

function InvoiceScreen() {
  const rows = [
    { id: "INV-1042", po: "PO-120", status: "Processing", tone: "wait" as const, amount: money(ORDER_TOTAL) },
    { id: "INV-1038", po: "PO-118", status: "Due in 12 days", tone: "due" as const, amount: "$4,200.00" },
    { id: "INV-1031", po: "PO-114", status: "Paid", tone: "paid" as const, amount: "$2,640.00" },
  ];
  return (
    <div style={{ height: "100%", background: C.paper, padding: `${CHROME + 22}px ${PAD}px 0`, boxSizing: "border-box" }}>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>Invoices & terms</div>
      <div style={{ marginTop: 6, fontSize: 13, color: C.muted }}>Net 30 · $4,200 of $10,000 used</div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: C.line }}>
        <div style={{ width: "42%", height: "100%", borderRadius: 99, background: C.blue }} />
      </div>
      <div style={{ marginTop: 18 }}>
        {rows.map((row) => (
          <div
            key={row.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 0",
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <div style={{ width: 92, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{row.id}</div>
            <div style={{ width: 80, fontSize: 13, color: C.muted }}>{row.po}</div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "3px 8px",
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  background: row.tone === "paid" ? C.greenWash : row.tone === "due" ? "#FFF6D8" : C.field,
                  color: row.tone === "paid" ? C.green : row.tone === "due" ? "#8A6100" : C.muted,
                }}
              >
                {row.status}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{row.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageScreen() {
  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        padding: `${CHROME}px ${PAD}px 0`,
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 10,
          border: `1px solid ${C.lineStrong}`,
          background: C.paper,
          boxShadow: "0 10px 28px rgba(20,20,18,0.14)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderBottom: `1px solid ${C.lineStrong}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>Message sales</div>
          <div style={{ marginLeft: "auto", fontSize: 13, fontWeight: 500, color: C.muted }}>JOOLA Sales</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, background: C.band }}>
          <div style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
            <Bubble who="Anna Bright" role="Buyer" text={ANNA} fill={C.field} />
            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 4,
                fontSize: 11,
                color: C.faint,
              }}
            >
              <svg width={12} height={12} viewBox="0 0 16 16" style={{ display: "block" }}>
                <path
                  d="M3.2 8.3 6.3 11.4 12.8 4.6"
                  fill="none"
                  stroke={C.faint}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sent
            </div>
          </div>
          <Bubble who="Sam Ortiz" role="JOOLA Sales" text={REP} fill={C.paper} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderTop: `1px solid ${C.lineStrong}`,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 46,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              borderRadius: 10,
              background: C.field,
              color: C.faint,
              fontSize: 15,
            }}
          >
            Message the sales team
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              background: C.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 16 16">
              <path
                d="M8 12.5V3.5M8 3.5 4.75 6.75M8 3.5l3.25 3.25"
                fill="none"
                stroke={C.buttonText}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, role, text, fill }: { who: string; role: string; text: string; fill: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: fill,
        border: `1px solid ${C.lineStrong}`,
      }}
    >
      <div style={{ fontSize: 12, lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>{who}</span>
        <span style={{ fontWeight: 500, color: C.muted }}> · {role}</span>
      </div>
      <div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.4 }}>{text}</div>
    </div>
  );
}

/** Straight line, ease-out, then a 3-frame 1px dip. Absent before the approach and after the dip. */
function leg(
  frame: number,
  start: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const arrive = start + MOVE;
  const end = arrive + DIP - 1;
  if (frame < start || frame > end) return null;
  return {
    x: move(frame, start, arrive, from.x, to.x),
    y: move(frame, start, arrive, from.y, to.y),
    dip: frame >= arrive ? 1 : 0,
  };
}

function cursorAt(frame: number) {
  const field = { x: FIELD_LEFT + 52, y: FIELD_TOP + 14 };
  const row = { x: FIELD_LEFT + FIELD_W - 28, y: FIELD_TOP + FIELD_H + 30 };
  const add = { x: ADD_LEFT + 16, y: ADD_TOP + 8 };

  const moving =
    leg(frame, FIELD_AT, { x: field.x - 36, y: field.y + 22 }, field) ??
    leg(frame, ROW_AT, field, row) ??
    leg(frame, ADD_AT, { x: add.x - 40, y: add.y - 24 }, add);
  if (moving) return moving;
  if (frame > FIELD_ARRIVE + DIP && frame < ROW_AT) return { ...field, dip: 0 };
  if (frame > ROW_ARRIVE + DIP && frame < CUT_REC) return { ...row, dip: 0 };
  if (frame > ADD_ARRIVE + DIP && frame < COUNT_END + 8) return { ...add, dip: 0 };
  return null;
}

export const JoolaB2B = () => {
  const frame = useCurrentFrame();
  const cursor = frame < INTRO ? null : cursorAt(frame);

  if (frame < INTRO) {
    const p = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: EASE_OUT });
    return (
      <AbsoluteFill style={{ background: C.paper, ...face }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: p }}>
          <Img src={joolaLogo} style={{ width: 280, height: "auto" }} />
        </div>
        <div style={{ position: "absolute", left: "50%", bottom: 120, width: 48, height: 3, marginLeft: -24, borderRadius: 2, background: C.blue, opacity: p }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div
        style={{
          ...face,
          width: PAGE_W,
          height: PAGE_H,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
          position: "relative",
          overflow: "hidden",
          background: C.paper,
        }}
      >
        {frame < CUT_REC ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <SearchScreen frame={frame} />
          </div>
        ) : null}
        {frame >= CUT_REC && frame < CUT_ORDER ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <RecommendedScreen />
          </div>
        ) : null}
        {frame >= CUT_ORDER && frame < CUT_INV ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <OrderScreen frame={frame} />
          </div>
        ) : null}
        {frame >= CUT_INV && frame < CUT_MSG ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <InvoiceScreen />
          </div>
        ) : null}
        {frame >= CUT_MSG ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <MessageScreen />
          </div>
        ) : null}
        <Chrome frame={frame} />
        {cursor ? <Pointer x={cursor.x} y={cursor.y} dip={cursor.dip} /> : null}
      </div>
    </AbsoluteFill>
  );
};
