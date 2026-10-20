import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import {
  PLACEMENT_GRID_PAD_X,
  PLACEMENT_ICON_SIZE,
  PLACEMENT_RADIUS_LG,
  PLACEMENT_SPACE_1,
  placementType,
} from "@/lib/caseStudies/dialoguePlacementTypography";
import { cornerOptics } from "./cornerOptics";
import { CheckoutFunnelChart } from "./CheckoutFunnelChart";
import { ClipThumbnailRow } from "./ClipThumbnailRow";
import { CounterEvidenceSection } from "./CounterEvidenceSection";
import { DerivedEvidenceLabel } from "./DerivedEvidenceLabel";
import { ShareExportIcon } from "./DialogueIcons";

const OUTER_RADIUS = PLACEMENT_RADIUS_LG;
const PAD = PLACEMENT_GRID_PAD_X - 4;

export function EvidenceAnswerCard({
  compact = false,
  fillHeight = false,
  fitFloating = false,
}: {
  compact?: boolean;
  fillHeight?: boolean;
  /** Tighter vertical rhythm so full card fits floating max height (no content removed). */
  fitFloating?: boolean;
}) {
  const inset = compact ? PLACEMENT_GRID_PAD_X - 4 : PAD;
  const copyIconInset = inset;
  const blockGap = fitFloating ? PLACEMENT_SPACE_1 : PLACEMENT_SPACE_1 + 2;
  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        borderRadius: OUTER_RADIUS,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        overflow: "hidden",
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        height: fillHeight ? "100%" : undefined,
        display: fillHeight ? "flex" : undefined,
        flexDirection: fillHeight ? "column" : undefined,
        minHeight: fillHeight ? 0 : undefined,
      }}
    >
      <div
        title="Copy as card"
        style={{
          position: "absolute",
          top: copyIconInset,
          right: copyIconInset,
          zIndex: 1,
          opacity: 0.88,
          lineHeight: 0,
          width: PLACEMENT_ICON_SIZE,
          height: PLACEMENT_ICON_SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ShareExportIcon size={PLACEMENT_ICON_SIZE} />
      </div>
      <div
        style={{
          padding: inset,
          paddingBottom: fitFloating ? PLACEMENT_SPACE_1 + 2 : PLACEMENT_SPACE_1 + 4,
          paddingRight: inset + PLACEMENT_ICON_SIZE + 4,
          flex: fillHeight ? 1 : undefined,
          minHeight: fillHeight ? 0 : undefined,
        }}
      >
        <p
          style={{
            margin: `0 0 ${blockGap}px`,
            ...placementType.body,
            fontWeight: 400,
            color: DIALOGUE_GRAPHICS_COLORS.ink,
          }}
        >
          Shipping address{" "}
          <span style={{ fontWeight: 500 }}>loses 38% of participants</span>, the largest single-step
          drop in checkout.
        </p>
        <CheckoutFunnelChart compact={compact} rowGap={fitFloating ? 5 : undefined} />
        <div style={{ marginTop: blockGap }}>
          <button
            type="button"
            style={{
              border: "none",
              background: "none",
              padding: 0,
              ...placementType.label,
              color: DIALOGUE_GRAPHICS_COLORS.accent,
              cursor: "default",
              fontFamily: DIALOGUE_GRAPHICS_FONT,
            }}
          >
            View 9 clips
          </button>
        </div>
        <div style={{ marginTop: blockGap }}>
          <ClipThumbnailRow compact={compact} max={3} />
        </div>
        <CounterEvidenceSection compact={compact} edgeGap={fitFloating ? PLACEMENT_SPACE_1 : undefined} />
      </div>
      <DerivedEvidenceLabel>Based on 24 of 24 interviews</DerivedEvidenceLabel>
    </div>
  );
}

export function evidenceInnerRadius() {
  return cornerOptics(OUTER_RADIUS, PAD);
}
