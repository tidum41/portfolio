import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_COPY_SEARCH_STATUS } from "@/lib/caseStudies/dialoguePlacementCopy";
import {
  PLACEMENT_GRID_PAD_X,
  PLACEMENT_ICON_SIZE,
  PLACEMENT_RADIUS_LG,
  PLACEMENT_RADIUS_MD,
  PLACEMENT_SPACE_1,
  placementType,
} from "@/lib/caseStudies/dialoguePlacementTypography";
import { EvidenceAnswerCard } from "@/components/dialogue/graphics/EvidenceAnswerCard";
import { ChevronDownIcon, DialogueAssistantMark } from "@/components/dialogue/graphics/DialogueIcons";

const CARD_PAD = PLACEMENT_GRID_PAD_X;

export function DialogueResearchAssistantPanel({
  compact,
  floating = false,
}: {
  compact: boolean;
  floating?: boolean;
}) {
  const fillColumn = compact;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: floating ? "auto" : fillColumn ? "100%" : "auto",
        minHeight: floating ? undefined : fillColumn ? 0 : undefined,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        color: DIALOGUE_GRAPHICS_COLORS.ink,
      }}
    >
      <header
        data-placement-crop="assistant-top"
        style={{
          padding: `${PLACEMENT_SPACE_1 + 4}px ${CARD_PAD}px ${PLACEMENT_SPACE_1}px`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: PLACEMENT_SPACE_1 }}>
          <DialogueAssistantMark size={22} />
          <div style={{ minWidth: 0 }}>
            <div style={{ ...placementType.title, fontSize: compact ? 14 : 15, lineHeight: compact ? "18px" : "20px" }}>
              Research assistant
            </div>
            <div style={{ marginTop: 2, ...placementType.meta, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
              Session 12, 24 interviews
            </div>
          </div>
        </div>
      </header>

      <div
        style={{
          flex: fillColumn ? 1 : undefined,
          minHeight: fillColumn ? 0 : undefined,
          padding: `0 ${CARD_PAD - 4}px ${CARD_PAD - 4}px`,
          display: "flex",
          flexDirection: "column",
          gap: floating ? PLACEMENT_SPACE_1 - 2 : PLACEMENT_SPACE_1,
          overflow: floating ? "visible" : fillColumn ? "auto" : "hidden",
        }}
      >
        <div
          style={{
            background: DIALOGUE_GRAPHICS_COLORS.bubble,
            borderRadius: PLACEMENT_RADIUS_LG,
            padding: `${PLACEMENT_SPACE_1 + 2}px ${PLACEMENT_GRID_PAD_X - 4}px`,
            ...placementType.body,
            color: DIALOGUE_GRAPHICS_COLORS.ink,
            flexShrink: 0,
          }}
        >
          Where did people drop off in checkout?
        </div>

        <div
          style={{
            border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
            borderRadius: PLACEMENT_RADIUS_MD,
            padding: `${PLACEMENT_SPACE_1 - 1}px ${PLACEMENT_SPACE_1 + 2}px`,
            ...placementType.labelRegular,
            color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: PLACEMENT_SPACE_1,
            flexShrink: 0,
            minHeight: 32,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>{PLACEMENT_COPY_SEARCH_STATUS}</span>
          <ChevronDownIcon size={PLACEMENT_ICON_SIZE} />
        </div>

        <div style={{ flexShrink: 0 }}>
          <EvidenceAnswerCard compact={compact} fitFloating={floating} />
        </div>
      </div>
    </div>
  );
}
