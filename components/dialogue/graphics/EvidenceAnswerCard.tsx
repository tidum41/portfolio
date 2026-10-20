import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { cornerOptics } from "./cornerOptics";
import { DerivedEvidenceLabel } from "./DerivedEvidenceLabel";
import { DropoffChart } from "./DropoffChart";

const OUTER_RADIUS = 12;
const PAD = 14;

export function EvidenceAnswerCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        borderRadius: OUTER_RADIUS,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        overflow: "hidden",
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div style={{ padding: PAD, paddingBottom: 12 }}>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: compact ? 12 : 13,
            lineHeight: 1.45,
            color: DIALOGUE_GRAPHICS_COLORS.ink,
          }}
        >
          Shipping address{" "}
          <strong style={{ fontWeight: 600 }}>loses 38% of participants</strong> at one step.
        </p>
        <DropoffChart compact={compact} />
      </div>
      <DerivedEvidenceLabel>Based on 24 of 24 interviews</DerivedEvidenceLabel>
    </div>
  );
}

export function evidenceInnerRadius() {
  return cornerOptics(OUTER_RADIUS, PAD);
}
