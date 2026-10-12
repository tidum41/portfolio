import "./joola/fonts";
import { FONT } from "./joola/fonts";
import { money, photos } from "./joola/products";
import { C, EASE_IN_OUT, clamp } from "./joola/theme";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import type { CSSProperties, ReactNode } from "react";

export const JOOLA_FPS = 30;

/** Each move is 16 frames, inside the 12–18 frame ease-in-out window. */
const PAN = 16;
const HOLD_SEARCH = 24;
const HOLD_REC = 24;
const HOLD_ORDER = 36;
const HOLD_MSG = 28;
const HOLD_END = 24;

const PAN_REC = HOLD_SEARCH;
const PAN_ORDER = PAN_REC + PAN + HOLD_REC;
const PAN_MSG = PAN_ORDER + PAN + HOLD_ORDER;
const PAN_HOME = PAN_MSG + PAN + HOLD_MSG;

export const JOOLA_DURATION = PAN_HOME + PAN + HOLD_END;

const HEADER = 58;
const SEARCH_H = 300;
const REC_H = 460;
const ORDER_H = 1022;
const MSG_H = 508;

const Y_REC = SEARCH_H - HEADER;
const Y_ORDER = SEARCH_H + REC_H - HEADER;
/** Land on the thread with the order still filling the frame above it. */
const Y_MSG = SEARCH_H + REC_H + ORDER_H + MSG_H - 1080;

const PLACEHOLDER = "Search by name, category, or SKU";
const WARN = "#8A6100";

const face: CSSProperties = {
  fontFamily: FONT,
  color: C.ink,
  lineHeight: 1.5,
};

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
];

type Line = {
  cat: string;
  name: string;
  sku: string;
  moq: string;
  low?: boolean;
  strike: number;
  unit: number;
  hint: string;
  best?: boolean;
  qty: number;
  line: number;
  photo?: string;
};

const LINES: Line[] = [
  {
    cat: "Paddles",
    name: "Perseus Pro V Pickleball Paddle",
    sku: "600558",
    moq: "MOQ 1",
    strike: 299.95,
    unit: 164.97,
    hint: "Buy 12+ for $149.98 ea",
    qty: 6,
    line: 989.82,
    photo: photos.perseus,
  },
  {
    cat: "Paddles",
    name: "Hyperion Pro IV 14mm Pickleball Paddle",
    sku: "600572",
    moq: "MOQ 1",
    low: true,
    strike: 229.95,
    unit: 114.98,
    hint: "Buy 24+ for $103.48 ea",
    qty: 12,
    line: 1379.76,
    photo: photos.hyperion,
  },
  {
    cat: "Paddles",
    name: "Scorpeus Pro IV 16mm Pickleball Paddle",
    sku: "600588",
    moq: "MOQ 1",
    strike: 229.95,
    unit: 103.48,
    hint: "Best price unlocked",
    best: true,
    qty: 24,
    line: 2483.52,
  },
  {
    cat: "Balls",
    name: "Indoor 3-Star Balls (6-Pack)",
    sku: "411032",
    moq: "MOQ 12 (1 case)",
    strike: 24.99,
    unit: 16.24,
    hint: "Buy 24+ for $14.99 ea",
    qty: 12,
    line: 194.88,
  },
  {
    cat: "Apparel",
    name: "Ben Johns Signature Hoodie",
    sku: "803221",
    moq: "MOQ 6 (half-dozen)",
    strike: 69.99,
    unit: 41.99,
    hint: "Buy 12+ for $38.49 ea",
    qty: 8,
    line: 335.92,
  },
  {
    cat: "Apparel",
    name: "Vision Performance Tee",
    sku: "810044",
    moq: "MOQ 6 (half-dozen)",
    strike: 34.99,
    unit: 17.5,
    hint: "Best price unlocked",
    best: true,
    qty: 24,
    line: 420,
  },
  {
    cat: "Apparel",
    name: "Court Cap",
    sku: "810099",
    moq: "MOQ 6 (half-dozen)",
    strike: 24.99,
    unit: 13.74,
    hint: "Buy 24+ for $12.50 ea",
    qty: 12,
    line: 164.88,
  },
  {
    cat: "Accessories",
    name: "Overgrip 3-Pack",
    sku: "902017",
    moq: "MOQ 12 (1 display box)",
    strike: 11.99,
    unit: 7.19,
    hint: "Buy 48+ for $6.59 ea",
    qty: 36,
    line: 258.84,
  },
];

const VISIBLE_TOTAL = LINES.reduce((sum, line) => sum + line.line, 0);

function leg(frame: number, at: number, from: number, to: number) {
  const p = interpolate(frame, [at, at + PAN], [0, 1], {
    ...clamp,
    easing: EASE_IN_OUT,
  });
  return from + (to - from) * p;
}

function cameraY(frame: number) {
  if (frame >= PAN_HOME) return leg(frame, PAN_HOME, Y_MSG, 0);
  if (frame >= PAN_MSG) return leg(frame, PAN_MSG, Y_ORDER, Y_MSG);
  if (frame >= PAN_ORDER) return leg(frame, PAN_ORDER, Y_REC, Y_ORDER);
  if (frame >= PAN_REC) return leg(frame, PAN_REC, 0, Y_REC);
  return 0;
}

function ExpandIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" style={{ display: "block" }}>
      <path
        d="M8 4.5H4.5V8M12 4.5h3.5V8M8 15.5H4.5V12M12 15.5h3.5V12"
        fill="none"
        stroke={C.muted}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block" }}>
      <path
        d="M8 12.5V3.5M8 3.5 4.75 6.75M8 3.5l3.25 3.25"
        fill="none"
        stroke={C.buttonText}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" style={{ display: "block" }}>
      <path
        d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
        fill="none"
        stroke={C.faint}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" style={{ display: "block" }}>
      <path
        d="M5.61 23H5C3.27 23 1.9 21.54 2.01 19.81L2.75 7.93C2.78 7.4 3.22 6.99 3.75 6.99H7.81L8.61 19.8C8.72 21.53 7.35 22.99 5.62 22.99L5.61 23Z"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.81 7H19.93C20.99 7 21.86 7.82 21.93 8.88L22.55 18.76C22.69 21.06 20.86 23.01 18.56 23.01H5.81"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.81 9V4.5C11.81 2.57 13.38 1 15.31 1C17.24 1 18.81 2.57 18.81 4.5V9"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.81 7V4.5C6.81 2.57 8.38 1 10.31 1"
        fill="none"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chrome() {
  const pill: CSSProperties = {
    padding: "10px 14px",
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 700,
    color: C.muted,
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: HEADER,
        zIndex: 2,
        background: C.paper,
        borderBottom: `1px solid ${C.lineStrong}`,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: 99, background: C.blue }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>Wholesale</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {["Quick Order", "Catalog", "Templates", "Order History", "Invoices & Terms", "Messages"].map(
          (label) => (
            <div key={label} style={pill}>
              {label}
            </div>
          ),
        )}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: C.field,
            borderRadius: 99,
            padding: "8px 14px 8px 8px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 99,
              background: C.blueWash,
              color: C.blue,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            PC
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Pickleball Central</div>
            <div style={{ fontSize: 11, color: C.faint }}>Anna Bright · Buyer</div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.ink,
            color: C.paper,
            borderRadius: 99,
            padding: "10px 14px",
          }}
        >
          <BagIcon />
          <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>$1,664.60</div>
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: 99,
              background: "#C0392B",
              color: C.paper,
              border: `2px solid ${C.paper}`,
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchSection() {
  return (
    <div style={{ height: SEARCH_H, boxSizing: "border-box", padding: `${HEADER + 32}px 16px 0`, background: C.paper }}>
      <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2 }}>Build a bulk order</div>
      <div style={{ marginTop: 8, maxWidth: 640, fontSize: 16, color: C.muted, lineHeight: 1.5 }}>
        Search or upload SKUs to add multiple products and quantities in one view. Pricing reflects
        Pickleball Central's wholesale tier.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24 }}>
        <div style={{ position: "relative", width: 420, flexShrink: 0 }}>
          <div
            style={{
              height: 46,
              display: "flex",
              alignItems: "center",
              paddingLeft: 40,
              borderRadius: 10,
              background: C.field,
              fontSize: 15,
              color: C.faint,
            }}
          >
            {PLACEHOLDER}
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: 15 }}>
            <circle cx="11" cy="11" r="7" fill="none" stroke={C.faint} strokeWidth={1.75} />
            <path d="m21 21-4.3-4.3" fill="none" stroke={C.faint} strokeWidth={1.75} strokeLinecap="round" />
          </svg>
        </div>
        <div
          style={{
            height: 46,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 18px",
            borderRadius: 6,
            border: `1.5px solid ${C.ink}`,
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24">
            <path d="M12 3v12m0 0 4-4m-4 4-4-4" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
          </svg>
          Bulk upload
        </div>
        <div style={{ marginLeft: "auto", fontSize: 13, color: C.faint }}>{LINES.length} lines in this order</div>
      </div>
    </div>
  );
}

function StillPhoto({
  src,
  sku,
  blur,
}: {
  src: string;
  sku: string;
  blur: number;
}) {
  const id = `move-${sku}`;
  const moving = blur > 0.4;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {moving ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id}>
            <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: moving ? `url(#${id})` : undefined,
        }}
      />
    </div>
  );
}

function RecommendedSection({ blur }: { blur: number }) {
  return (
    <div
      style={{
        height: REC_H,
        boxSizing: "border-box",
        background: C.band,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        padding: "24px 16px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>Recommended For You</div>
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
                left: 16,
                top: 2,
              }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>Showing</div>
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>Based on your orders.</div>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {PADDLES.map((paddle) => (
          <div key={paddle.sku} style={{ width: 224, flexShrink: 0 }}>
            <div
              style={{
                width: 224,
                height: 224,
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
                background: C.paper,
                border: `1px solid ${C.lineStrong}`,
              }}
            >
              <StillPhoto src={paddle.src} sku={paddle.sku} blur={blur} />
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
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: C.muted }}>Pickleball paddle</div>
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>{paddle.name}</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {money(paddle.price)}
              </span>
              {paddle.strike != null ? (
                <span style={{ fontSize: 11, color: C.faint, textDecoration: "line-through" }}>
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

function headerCell(extra: CSSProperties): CSSProperties {
  return {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: C.muted,
    lineHeight: 1.4,
    textAlign: "left",
    ...extra,
  };
}

function Thumb({ src, sku, blur }: { src?: string; sku: string; blur: number }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        background: C.field,
        border: `1px solid ${C.lineStrong}`,
        flexShrink: 0,
      }}
    >
      {src ? <StillPhoto src={src} sku={`row-${sku}`} blur={blur} /> : null}
    </div>
  );
}

function OrderSection({ blur }: { blur: number }) {
  let lastCat = "";
  const rows: ReactNode[] = [];
  LINES.forEach((line, i) => {
    if (line.cat !== lastCat) {
      lastCat = line.cat;
      rows.push(
        <div
          key={`cat-${line.cat}`}
          style={{
            padding: i === 0 ? "8px 8px 6px" : "20px 8px 6px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {line.cat}
        </div>,
      );
    }
    rows.push(
      <div
        key={line.sku}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 8px",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <Thumb src={line.photo} sku={line.sku} blur={blur} />
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{line.name}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>
            SKU {line.sku} · {line.moq}
            {line.low ? <span style={{ fontWeight: 700, color: WARN }}> · Low stock</span> : null}
          </div>
        </div>
        <div style={{ width: 150, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: C.faint, textDecoration: "line-through", lineHeight: 1.3 }}>
            {money(line.strike)}
          </div>
          <div style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>{money(line.unit)} ea</div>
          <div style={{ fontSize: 11, color: line.best ? C.green : C.muted, fontWeight: line.best ? 600 : 400 }}>
            {line.best ? (
              line.hint
            ) : (
              <>
                <span style={{ color: C.muted }}>{line.hint.replace(/\$[\d,.]+ ea$/, "")}</span>
                <span style={{ fontWeight: 700, color: C.ink }}>{line.hint.match(/\$[\d,.]+ ea$/)?.[0]}</span>
              </>
            )}
          </div>
        </div>
        <div style={{ width: 170, flexShrink: 0 }}>
          <div
            style={{
              width: 120,
              height: 40,
              borderRadius: 10,
              background: C.field,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ width: 36, textAlign: "center", fontSize: 16 }}>–</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 600 }}>{line.qty}</div>
            <div style={{ width: 36, textAlign: "center", fontSize: 16 }}>+</div>
          </div>
        </div>
        <div
          style={{
            width: 130,
            flexShrink: 0,
            textAlign: "right",
            fontSize: 17,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {money(line.line)}
        </div>
        <div style={{ width: 40, flexShrink: 0, display: "flex", justifyContent: "center" }}>
          <RemoveIcon />
        </div>
      </div>,
    );
  });

  return (
    <div
      style={{
        height: ORDER_H,
        boxSizing: "border-box",
        background: C.paper,
        display: "flex",
        flexDirection: "column",
        padding: "12px 16px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 8px 12px",
          borderBottom: `1.5px solid ${C.ink}`,
        }}
      >
        <div style={{ width: 56, flexShrink: 0 }} />
        <div style={headerCell({ flex: 1, minWidth: 0 })}>Product</div>
        <div style={headerCell({ width: 150 })}>Price</div>
        <div style={headerCell({ width: 170 })}>Quantity</div>
        <div style={headerCell({ width: 130, textAlign: "right" })}>Line total</div>
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>
      <div>{rows}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "16px 0",
          fontSize: 13,
          fontWeight: 600,
          color: C.muted,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Show 5 more lines (13 total)
      </div>
      <div
        style={{
          marginTop: "auto",
          borderTop: `1.5px solid ${C.ink}`,
          boxShadow: "0 -8px 24px rgba(20,20,18,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 0",
          background: C.paper,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1 }}>{LINES.length} lines</div>
          <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {money(VISIBLE_TOTAL)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              height: 46,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
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
              height: 46,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              borderRadius: 6,
              background: C.black,
              color: C.buttonText,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Add All To Cart
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  align,
  who,
  text,
  fill,
}: {
  align: "start" | "end";
  who: string;
  text: string;
  fill: string;
}) {
  return (
    <div
      style={{
        alignSelf: align === "end" ? "flex-end" : "flex-start",
        maxWidth: "80%",
        padding: "10px 14px",
        borderRadius: 10,
        background: fill,
        border: `1px solid ${C.lineStrong}`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>{who}</div>
      <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.45 }}>{text}</div>
    </div>
  );
}

function MessageSection() {
  return (
    <div style={{ height: MSG_H, boxSizing: "border-box", background: C.paper, padding: "28px 16px 0" }}>
      <div
        style={{
          width: 640,
          margin: "0 auto",
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
            padding: "12px 16px",
            borderBottom: `1px solid ${C.lineStrong}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>Message sales</div>
          <div style={{ marginLeft: "auto" }}>
            <ExpandIcon />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, background: C.band }}>
          <Bubble
            align="end"
            who="Anna Bright · Pickleball Central"
            text="Perseus Pro V, SKU 600558. When can you restock 120 units?"
            fill={C.field}
          />
          <Bubble
            align="start"
            who="Sam Ortiz · JOOLA Sales"
            text="120 units of Perseus Pro V ship Friday."
            fill={C.paper}
          />
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
            <SendIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

export const JoolaB2B = () => {
  const frame = useCurrentFrame();
  const y = cameraY(frame);
  const prev = cameraY(Math.max(0, frame - 1));
  const dy = Math.abs(y - prev);
  const blur = dy > 2 ? Math.min(5, (dy - 2) * 0.18) : 0;

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <div style={{ ...face, width: 1920, position: "relative" }}>
        <div style={{ transform: `translateY(${-y}px)` }}>
          <SearchSection />
          <RecommendedSection blur={blur} />
          <OrderSection blur={blur} />
          <MessageSection />
        </div>
        <Chrome />
      </div>
    </AbsoluteFill>
  );
};
