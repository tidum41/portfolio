import {
  PLACEMENT_LAYOUT_HEIGHT,
  PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SIDEBAR_WIDTH,
  PLACEMENT_STUDY_WIDTH_DOCKED,
  PLACEMENT_FLOATING_CHAT_TOP,
  PLACEMENT_FLOATING_EDGE,
  PLACEMENT_FLOATING_LAUNCHER_SIZE,
  PLACEMENT_FLOATING_LAUNCHER_GAP,
  PLACEMENT_FLOATING_PANEL_LEFT,
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
      <DialogueStudyHostPage reserveRightForFloatingChat={true} />
      <div
        style={{
          position: "absolute",
          left: PLACEMENT_FLOATING_PANEL_LEFT,
          top: PLACEMENT_FLOATING_CHAT_TOP,
          bottom: PLACEMENT_FLOATING_EDGE,
          width: PLACEMENT_FLOATING_PANEL_WIDTH,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: PLACEMENT_FLOATING_LAUNCHER_GAP,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 14,
            boxShadow: "0 10px 28px rgba(26, 24, 22, 0.08)",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 14,
              border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
              background: DIALOGUE_GRAPHICS_COLORS.surface,
              overflow: "hidden",
            }}
          >
            <DialogueResearchAssistantPanel compact floating />
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "auto",
          }}
        >
          <DialogueChatLauncher size={PLACEMENT_FLOATING_LAUNCHER_SIZE} />
        </div>
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
