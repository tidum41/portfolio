import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Drop-off % at each step — bar length equals the value (0% = empty track). */
const STEPS = [
  { label: "Cart", pct: 0, tone: "neutral" as const },
  { label: "Address", pct: 38, tone: "accent" as const },
  { label: "Delivery", pct: 8, tone: "muted" as const },
  { label: "Payment", pct: 12, tone: "muted" as const },
  { label: "Confirm", pct: 6, tone: "muted" as const },
];

const CHART_MAX_PCT = 40;

export function DropoffChart({ compact = false }: { compact?: boolean }) {
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
        Drop-off by checkout step, % of participants
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 7 }}>
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
              {step.pct > 0 ? (
                <div
                  style={{
                    width: `${(step.pct / CHART_MAX_PCT) * 100}%`,
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
              ) : null}
            </div>
            <span
              style={{
                width: 28,
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
    </div>
  );
}
