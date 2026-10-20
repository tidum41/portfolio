import {
  PLACEMENT_LAYOUT_HEIGHT,
  PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SIDEBAR_WIDTH,
  PLACEMENT_STUDY_WIDTH_DOCKED,
  type PlacementVariant,
} from "@/lib/caseStudies/dialoguePlacementExport";
import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { DialogueChatLauncher } from "@/components/dialogue/graphics/DialogueChatLauncher";
import { DialogueResearchAssistantPanel } from "@/components/dialogue/DialogueResearchAssistantPanel";
import { DialogueStudyHostPage } from "@/components/dialogue/DialogueStudyHostPage";

function PlacementFrame({ variant }: { variant: PlacementVariant }) {
  const docked = variant === "docked";

  if (docked) {
    return (
      <div
        style={{
          width: PLACEMENT_LAYOUT_WIDTH,
          height: PLACEMENT_LAYOUT_HEIGHT,
          display: "flex",
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
          background: DIALOGUE_GRAPHICS_COLORS.surface,
        }}
      >
        <div style={{ width: PLACEMENT_STUDY_WIDTH_DOCKED, flexShrink: 0, height: "100%" }}>
          <DialogueStudyHostPage />
        </div>
        <div
          style={{
            width: PLACEMENT_SIDEBAR_WIDTH,
            flexShrink: 0,
            height: "100%",
            borderLeft: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
            background: DIALOGUE_GRAPHICS_COLORS.studyChrome,
          }}
        >
          <DialogueResearchAssistantPanel compact />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: PLACEMENT_LAYOUT_WIDTH,
        height: PLACEMENT_LAYOUT_HEIGHT,
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
      }}
    >
      <DialogueStudyHostPage />
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 14,
          width: 292,
          maxHeight: "calc(100% - 28px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
            background: DIALOGUE_GRAPHICS_COLORS.surface,
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <DialogueResearchAssistantPanel compact />
        </div>
        <DialogueChatLauncher size={48} />
      </div>
    </div>
  );
}

export function DialoguePlacementScene({
  variant,
  scale,
}: {
  variant: PlacementVariant;
  scale: number;
}) {
  const scaledW = Math.round(PLACEMENT_LAYOUT_WIDTH * scale);
  const scaledH = Math.round(PLACEMENT_LAYOUT_HEIGHT * scale);

  return (
    <div style={{ width: scaledW, height: scaledH, position: "relative", flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: PLACEMENT_LAYOUT_WIDTH,
          height: PLACEMENT_LAYOUT_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <PlacementFrame variant={variant} />
      </div>
    </div>
  );
}
