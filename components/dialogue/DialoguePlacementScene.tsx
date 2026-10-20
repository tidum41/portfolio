import {
  PLACEMENT_LAYOUT_HEIGHT,
  PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SIDEBAR_WIDTH,
  PLACEMENT_STUDY_WIDTH_DOCKED,
  PLACEMENT_FLOATING_CHAT_TOP,
  PLACEMENT_FLOATING_EDGE,
  PLACEMENT_FLOATING_LAUNCHER_SIZE,
  PLACEMENT_FLOATING_PANEL_BOTTOM,
  PLACEMENT_FLOATING_PANEL_WIDTH,
  type PlacementVariant,
} from "@/lib/caseStudies/dialoguePlacementExport";
import "@/app/dev/dialogue-placement-export/placement-areal.css";
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
          <DialogueStudyHostPage reserveRightForFloatingChat={false} />
        </div>
        <div
          style={{
            width: PLACEMENT_SIDEBAR_WIDTH,
            flexShrink: 0,
            height: "100%",
            borderLeft: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
            background: DIALOGUE_GRAPHICS_COLORS.surface,
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
      <DialogueStudyHostPage reserveRightForFloatingChat />
      <div
        style={{
          position: "absolute",
          right: PLACEMENT_FLOATING_EDGE,
          top: PLACEMENT_FLOATING_CHAT_TOP,
          bottom: PLACEMENT_FLOATING_PANEL_BOTTOM,
          width: PLACEMENT_FLOATING_PANEL_WIDTH,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: "100%",
            maxHeight: "100%",
            borderRadius: 14,
            border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
            background: DIALOGUE_GRAPHICS_COLORS.surface,
            boxShadow: "0 10px 28px rgba(26, 24, 22, 0.08)",
            overflow: "visible",
            pointerEvents: "auto",
          }}
        >
          <DialogueResearchAssistantPanel compact floating />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: PLACEMENT_FLOATING_EDGE,
          bottom: PLACEMENT_FLOATING_EDGE,
          pointerEvents: "auto",
        }}
      >
        <DialogueChatLauncher size={PLACEMENT_FLOATING_LAUNCHER_SIZE} />
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
