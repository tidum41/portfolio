import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

const STEPS = [
  { label: "Cart", pct: 100, tone: "neutral" as const },
  { label: "Address", pct: 62, tone: "accent" as const },
  { label: "Delivery", pct: 54, tone: "muted" as const },
  { label: "Payment", pct: 42, tone: "muted" as const },
  { label: "Confirm", pct: 36, tone: "muted" as const },
];

export function CheckoutFunnelChart({ compact = false }: { compact?: boolean }) {
  const labelW = compact ? 54 : 62;
  const barH = compact ? 7 : 8;
  const fontSize = compact ? 10 : 11;

  return (
    <div style={{ fontFamily: DIALOGUE_GRAPHICS_FONT }}>
      <div
        style={{
          fontSize: compact ? 10 : 11,
          color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
          marginBottom: 8,
          lineHeight: 1.35,
        }}
      >
        Checkout funnel, % of participants still in study
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 5 : 7 }}>
        {STEPS.map((step) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: labelW,
                flexShrink: 0,
                fontSize,
                color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
              }}
            >
              {step.label}
            </span>
            <div
              style={{
                flex: 1,
                height: barH,
                borderRadius: 4,
                background: DIALOGUE_GRAPHICS_COLORS.barTrack,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${step.pct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background:
                    step.tone === "accent"
                      ? DIALOGUE_GRAPHICS_COLORS.accent
                      : step.tone === "neutral"
                        ? DIALOGUE_GRAPHICS_COLORS.barNeutral
                        : DIALOGUE_GRAPHICS_COLORS.barMuted,
                }}
              />
            </div>
            <span
              style={{
                width: 30,
                flexShrink: 0,
                textAlign: "right",
                fontSize,
                color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
              }}
            >
              {step.pct}%
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: compact ? 10 : 11,
          color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
          lineHeight: 1.35,
        }}
      >
        Largest drop: Shipping address (-38%)
      </div>
    </div>
  );
}
