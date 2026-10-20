import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_COPY_FUNNEL_CAPTION } from "@/lib/caseStudies/dialoguePlacementCopy";
import { PLACEMENT_SPACE_1, placementType } from "@/lib/caseStudies/dialoguePlacementTypography";

const STEPS = [
  { label: "Cart", pct: 100, tone: "neutral" as const },
  { label: "Address", pct: 62, tone: "accent" as const },
  { label: "Delivery", pct: 54, tone: "muted" as const },
  { label: "Payment", pct: 42, tone: "muted" as const },
  { label: "Confirm", pct: 36, tone: "muted" as const },
];

export function CheckoutFunnelChart({
  compact = false,
  tight = false,
}: {
  compact?: boolean;
  tight?: boolean;
}) {
  const labelW = compact ? 56 : 62;
  const barH = 8;
  const rowGap = tight ? 4 : compact ? 6 : PLACEMENT_SPACE_1 - 1;
  const captionMargin = tight ? PLACEMENT_SPACE_1 - 2 : PLACEMENT_SPACE_1;

  return (
    <div data-placement-crop="funnel" style={{ fontFamily: DIALOGUE_GRAPHICS_FONT }}>
      <div
        style={{
          ...placementType.labelRegular,
          color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
          marginBottom: captionMargin,
          whiteSpace: "nowrap",
        }}
      >
        {PLACEMENT_COPY_FUNNEL_CAPTION}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
        {STEPS.map((step) => (
          <div key={step.label} style={{ display: "flex", alignItems: "center", gap: PLACEMENT_SPACE_1 }}>
            <span
              style={{
                width: labelW,
                flexShrink: 0,
                ...placementType.labelRegular,
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
                width: 34,
                flexShrink: 0,
                textAlign: "right",
                ...placementType.labelRegular,
                ...placementType.tabular,
                color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
              }}
            >
              {step.pct}%
            </span>
          </div>
        ))}
      </div>
      {!tight && (
        <div
          style={{
            marginTop: PLACEMENT_SPACE_1,
            ...placementType.labelRegular,
            color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
            whiteSpace: "nowrap",
          }}
        >
          Largest drop: Shipping address (-38%)
        </div>
      )}
    </div>
  );
}
