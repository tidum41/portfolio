import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import {
  PLACEMENT_ICON_SIZE,
  PLACEMENT_RADIUS_SM,
  PLACEMENT_SPACE_1,
  placementType,
} from "@/lib/caseStudies/dialoguePlacementTypography";
import { ChevronDownIcon, CounterEvidenceIcon } from "./DialogueIcons";

export function CounterEvidenceSection({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        paddingTop: PLACEMENT_SPACE_1 + 2,
        marginTop: PLACEMENT_SPACE_1 + 2,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <CounterEvidenceIcon size={PLACEMENT_ICON_SIZE} />
        <span style={{ ...placementType.label, color: DIALOGUE_GRAPHICS_COLORS.inkMuted }}>
          Counter evidence
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: PLACEMENT_SPACE_1,
          padding: `${PLACEMENT_SPACE_1 - 1}px ${PLACEMENT_SPACE_1 + 2}px`,
          borderRadius: PLACEMENT_RADIUS_SM,
          background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
          border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
          minHeight: 32,
        }}
      >
        <span style={{ ...placementType.labelRegular, color: DIALOGUE_GRAPHICS_COLORS.ink }}>
          3 had no trouble with address
        </span>
        <ChevronDownIcon size={PLACEMENT_ICON_SIZE} />
      </div>
    </div>
  );
}
