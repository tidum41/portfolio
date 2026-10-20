import { PLACEMENT_FLOATING_STUDY_MAX_WIDTH } from "@/lib/caseStudies/dialoguePlacementExport";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import {
  PLACEMENT_GRID_PAD_X,
  PLACEMENT_GRID_PAD_Y,
  PLACEMENT_SPACE_1,
  placementType,
} from "@/lib/caseStudies/dialoguePlacementTypography";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { DialogueStudyTranscript } from "@/components/dialogue/DialogueStudyTranscript";

const TAB_HEIGHT = 24;

/** Study-page chrome shared by docked and floating placement tiles. */
export function DialogueStudyHostPage({
  reserveRightForFloatingChat = false,
}: {
  reserveRightForFloatingChat?: boolean;
}) {
  const studyChromeWidth = reserveRightForFloatingChat ? PLACEMENT_FLOATING_STUDY_MAX_WIDTH : undefined;
  const edgePadX = reserveRightForFloatingChat ? `${PLACEMENT_GRID_PAD_X}px 0` : `${PLACEMENT_GRID_PAD_X}px`;

  return (
    <div
      style={{
        flex: reserveRightForFloatingChat ? "0 0 auto" : 1,
        minWidth: 0,
        width: studyChromeWidth ?? "100%",
        maxWidth: studyChromeWidth ?? undefined,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: PLACEMENT_SPACE_1,
          padding: `${PLACEMENT_GRID_PAD_Y}px ${edgePadX}`,
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ ...placementType.title, color: DIALOGUE_GRAPHICS_COLORS.ink }}>
            Checkout usability Q3
          </div>
          <div style={{ marginTop: 2, ...placementType.meta, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
            Session 12, 24 interviews
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {["Clips", "Transcript", "Notes"].map((tab, i) => (
            <span
              key={tab}
              style={{
                ...placementType.label,
                fontWeight: i === 1 ? 500 : 400,
                height: TAB_HEIGHT,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 10px",
                borderRadius: 999,
                background: i === 1 ? DIALOGUE_GRAPHICS_COLORS.bubble : "transparent",
                color: i === 1 ? DIALOGUE_GRAPHICS_COLORS.ink : DIALOGUE_GRAPHICS_COLORS.inkSoft,
                border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
                boxSizing: "border-box",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </header>

      <div
        style={{
          padding: `${PLACEMENT_SPACE_1}px ${edgePadX}`,
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        }}
      >
        <DialogueInterviewPlayer />
      </div>

      <DialogueStudyTranscript reserveRightForFloatingChat={reserveRightForFloatingChat} />
    </div>
  );
}
