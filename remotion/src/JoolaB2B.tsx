import "./joola/fonts";
import { FONT } from "./joola/fonts";
import { money, photos } from "./joola/products";
import { C, EASE_IN_OUT, EASE_OUT, clamp } from "./joola/theme";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import type { CSSProperties } from "react";

export const JOOLA_FPS = 30;
export const JOOLA_DURATION = 280;

/** Design size of one screenful. Scaled uniformly onto 1920×1080. */
const PAGE_W = 800;
const PAGE_H = 450;
const SCALE = 1920 / PAGE_W;
const HEADER = 56;
const SEARCH_H = 360;
const REC_H = 450;
const ORDER_H = 430;
const MSG_H = 400;
const Y_REC = SEARCH_H;
const Y_ORDER = SEARCH_H + REC_H;
const Y_MSG = Y_ORDER + ORDER_H;

const RESULT_AT = 18;
const PAN_F = 16;
const PAN_REC = 50;
const TOGGLE_AT = 90;
const TOGGLE_F = 8;
const SLIDE_AT = 102;
const SLIDE_F = 12;
const PAN_ORDER = 150;
const PAN_MSG = 198;
const PAN_HOME = 246;

const SKU = "600558";
const PLACEHOLDER = "Search by name, category, or SKU";
const ANNA = "Perseus Pro V, SKU 600558. When can you restock 120 units?";
const REP = "120 units of Perseus Pro V ship Friday.";

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
    qty: 6,
    line: 1799.7,
  },
  {
    src: photos.hyperion,
    chip: "Your history",
    name: "Hyperion Pro IV",
    price: 149.95,
    strike: 229.95,
    sku: "300829",
    qty: 6,
    line: 899.7,
  },
  {
    src: photos.scorpeus,
    chip: "Also due",
    name: "Scorpeus Pro V",
    price: 299.95,
    strike: null,
    sku: "600567",
    qty: 6,
    line: 1799.7,
  },
];

function leg(frame: number, at: number, from: number, to: number) {
  const p = interpolate(frame, [at, at + PAN_F], [0, 1], {
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

function Chevron() {
  return (
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
  );
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
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: 99, background: C.blue }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>Wholesale</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={pill}>Quick Order</div>
        <div style={pill}>Catalog</div>
        <div style={pill}>Messages</div>
      </div>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: C.field,
          borderRadius: 99,
          padding: "8px 14px 8px 8px",
          flexShrink: 0,
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
    </div>
  );
}

function SearchSection({ frame }: { frame: number }) {
  const resting = frame < RESULT_AT || frame >= PAN_HOME;
  const showResult = !resting;
  const text = resting ? PLACEHOLDER : SKU;

  return (
    <div style={{ height: SEARCH_H, padding: `${HEADER + 28}px 16px 0`, boxSizing: "border-box" }}>
      <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2 }}>Build a bulk order</div>
      <div style={{ marginTop: 8, maxWidth: 640, fontSize: 16, color: C.muted, lineHeight: 1.5 }}>
        Search or upload SKUs to add multiple products and quantities in one view. Pricing reflects
        Pickleball Central's wholesale tier.
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 24 }}>
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
              color: resting ? C.faint : C.ink,
            }}
          >
            <span>{text}</span>
          </div>
          <svg width={16} height={16} viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: 15 }}>
            <circle cx="11" cy="11" r="7" fill="none" stroke={C.faint} strokeWidth={1.75} />
            <path d="m21 21-4.3-4.3" fill="none" stroke={C.faint} strokeWidth={1.75} strokeLinecap="round" />
          </svg>
          {showResult ? (
            <div
              style={{
                position: "absolute",
                top: 54,
                left: 0,
                width: 420,
                padding: 6,
                borderRadius: 10,
                background: C.paper,
                border: `1px solid ${C.lineStrong}`,
                boxShadow: "0 10px 28px rgba(20,20,18,0.14)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 8,
                  borderRadius: 5,
                }}
              >
                <Img
                  src={photos.perseus}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 5,
                    objectFit: "cover",
                    border: `1px solid ${C.lineStrong}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>Perseus Pro V</div>
                  <div style={{ fontSize: 12, color: C.muted }}>SKU 600558 · $299.95 · MOQ 1</div>
                </div>
                <Chevron />
              </div>
            </div>
          ) : null}
        </div>
        <div
          style={{
            height: 46,
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
      </div>
    </div>
  );
}

function CardPhoto({ src, sku, moving, blur }: { src: string; sku: string; moving: boolean; blur: number }) {
  const id = `card-blur-${sku}`;
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

function RecommendedSection({ frame }: { frame: number }) {
  const returned = frame >= PAN_HOME;
  const travel = returned
    ? 0
    : interpolate(frame, [TOGGLE_AT, TOGGLE_AT + TOGGLE_F], [0, 1], {
        ...clamp,
        easing: EASE_OUT,
      });
  const p = returned
    ? 0
    : interpolate(frame, [SLIDE_AT, SLIDE_AT + SLIDE_F], [0, 1], {
        ...clamp,
        easing: EASE_OUT,
      });
  const showCards = frame >= SLIDE_AT && !returned;
  const showing = travel >= 1;
  const moving = showCards && p < 1;
  const y = (showCards ? 1 - p : 1) * 24;

  return (
    <div
      style={{
        height: REC_H,
        boxSizing: "border-box",
        background: C.band,
        padding: `${HEADER + 20}px 16px 0`,
      }}
    >
      <div style={{ transform: `translateY(${y}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: showing ? C.ink : C.dim }}>
            Recommended For You
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 18,
                borderRadius: 99,
                background: travel > 0.5 ? C.ink : C.lineStrong,
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
                  transform: `translateX(${travel * 14}px)`,
                }}
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
              {showing ? "Showing" : "Hidden"}
            </div>
          </div>
        </div>
        {showing ? (
          <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>Based on your orders.</div>
        ) : null}
      </div>
      {showCards ? (
        <div style={{ display: "flex", gap: 16, marginTop: 16, transform: `translateY(${(1 - p) * 24}px)` }}>
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
                <CardPhoto src={paddle.src} sku={paddle.sku} moving={moving} blur={(1 - p) * 6} />
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
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500 }}>{paddle.name}</div>
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
      ) : null}
    </div>
  );
}

function headerCell(grow: boolean): CSSProperties {
  return {
    flex: grow ? 1 : undefined,
    minWidth: grow ? 0 : undefined,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: C.muted,
    lineHeight: 1.4,
    textAlign: "left",
  };
}

function OrderSection() {
  return (
    <div style={{ height: ORDER_H, boxSizing: "border-box", background: C.paper }}>
      <div style={{ height: HEADER, flexShrink: 0 }} />
      <div style={{ padding: "12px 8px 0" }}>
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
          <div style={headerCell(true)}>Product</div>
          <div style={{ ...headerCell(false), width: 150 }}>Price</div>
          <div style={{ ...headerCell(false), width: 170 }}>Quantity</div>
          <div style={{ ...headerCell(false), width: 130, textAlign: "right" }}>Line total</div>
          <div style={{ width: 40, flexShrink: 0 }} />
        </div>
        {PADDLES.map((line, i) => (
          <div
            key={line.sku}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 8px",
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
                border: `1px solid ${C.lineStrong}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{line.name}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>SKU {line.sku} · MOQ 1</div>
            </div>
            <div style={{ width: 150, flexShrink: 0 }}>
              {line.strike != null ? (
                <div style={{ fontSize: 12, color: C.faint, textDecoration: "line-through", lineHeight: 1.3 }}>
                  {money(line.strike)}
                </div>
              ) : null}
              <div style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>{money(line.price)} ea</div>
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
              <svg width={16} height={16} viewBox="0 0 16 16">
                <path
                  d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                  fill="none"
                  stroke={C.faint}
                  strokeWidth={1.75}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: `1.5px solid ${C.ink}`,
          boxShadow: "0 -8px 24px rgba(20,20,18,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px",
          background: C.paper,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1 }}>3 lines</div>
          <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {money(4499.1)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              height: 46,
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

function MessageSection() {
  return (
    <div style={{ height: MSG_H, boxSizing: "border-box", background: C.paper, padding: `${HEADER + 24}px 16px 0` }}>
      <div
        style={{
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
          <Bubble align="end" who="Anna Bright · Pickleball Central" text={ANNA} fill={C.field} />
          <Bubble align="start" who="Sam Ortiz · JOOLA Sales" text={REP} fill={C.paper} />
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
        maxWidth: "88%",
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

export const JoolaB2B = () => {
  const frame = useCurrentFrame();
  const y = cameraY(frame);

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
        <div style={{ transform: `translateY(${-y}px)` }}>
          <SearchSection frame={frame} />
          <RecommendedSection frame={frame} />
          <OrderSection />
          <MessageSection />
        </div>
        <Chrome />
      </div>
    </AbsoluteFill>
  );
};
