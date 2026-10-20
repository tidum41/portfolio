import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { cornerOptics } from "./cornerOptics";
import { CheckoutFunnelChart } from "./CheckoutFunnelChart";
import { ClipThumbnailRow } from "./ClipThumbnailRow";
import { CounterEvidenceSection } from "./CounterEvidenceSection";
import { DerivedEvidenceLabel } from "./DerivedEvidenceLabel";
import { ShareExportIcon } from "./DialogueIcons";

const OUTER_RADIUS = 12;
const PAD = 14;

export function EvidenceAnswerCard({ compact = false }: { compact?: boolean }) {
  const inset = compact ? 10 : PAD;
  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        borderRadius: OUTER_RADIUS,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        overflow: "hidden",
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        title="Copy as card"
        style={{
          position: "absolute",
          top: inset,
          right: inset,
          zIndex: 1,
          opacity: 0.88,
          lineHeight: 0,
        }}
      >
        <ShareExportIcon size={compact ? 12 : 13} />
      </div>
      <div style={{ padding: inset, paddingBottom: compact ? 8 : 12, paddingRight: inset + 16 }}>
        <p
          style={{
            margin: "0 0 10px",
            fontSize: compact ? 11 : 12,
            lineHeight: 1.45,
            color: DIALOGUE_GRAPHICS_COLORS.ink,
          }}
        >
          Shipping address{" "}
          <span style={{ fontWeight: 500 }}>loses 38% of participants</span>, the largest single-step
          drop in checkout.
        </p>
        <CheckoutFunnelChart compact={compact} />
        <div style={{ marginTop: compact ? 8 : 10 }}>
          <button
            type="button"
            style={{
              border: "none",
              background: "none",
              padding: 0,
              fontSize: compact ? 10 : 11,
              fontWeight: 500,
              color: DIALOGUE_GRAPHICS_COLORS.accent,
              cursor: "default",
              fontFamily: DIALOGUE_GRAPHICS_FONT,
            }}
          >
            View 9 clips
          </button>
        </div>
        {!compact ? (
          <div style={{ marginTop: 10 }}>
            <ClipThumbnailRow compact={compact} max={3} />
          </div>
        ) : null}
        <CounterEvidenceSection compact={compact} />
        {!compact ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 10,
            }}
          >
            {["Show mobile only", "Compare to round 1"].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 10,
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
                  color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
                  background: DIALOGUE_GRAPHICS_COLORS.surface,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <DerivedEvidenceLabel>Based on 24 of 24 interviews</DerivedEvidenceLabel>
    </div>
  );
}

export function evidenceInnerRadius() {
  return cornerOptics(OUTER_RADIUS, PAD);
}
