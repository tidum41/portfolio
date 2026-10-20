import {
  PLACEMENT_PLAYER_CONTROL_HEIGHT,
  PLACEMENT_PLAYER_TOTAL_HEIGHT,
  PLACEMENT_PLAYER_VIDEO_HEIGHT,
  STUDY_PLAYER_PAD_X,
} from "@/lib/caseStudies/dialogueStudyPlacementLayout";
import { PLACEMENT_STUDY_WIDTH_DOCKED } from "@/lib/caseStudies/dialoguePlacementExport";
import {
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_LETTERBOX,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC,
} from "@/lib/caseStudies/dialoguePlacementStill";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { DialoguePlayerControlBar } from "@/components/dialogue/DialoguePlayerControlBar";

/** Match docked study column so cover crop is identical in floating + docked tiles. */
const PLACEMENT_PLAYER_BODY_WIDTH = PLACEMENT_STUDY_WIDTH_DOCKED - STUDY_PLAYER_PAD_X * 2;

/** Blurred interview still (raster) + live HTML control bar (approved section-5 pattern). */
export function DialogueInterviewPlayer() {
  return (
    <div
      style={{
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        background: "#161412",
        position: "relative",
        width: PLACEMENT_PLAYER_BODY_WIDTH,
        maxWidth: "100%",
        height: PLACEMENT_PLAYER_TOTAL_HEIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: PLACEMENT_PLAYER_VIDEO_HEIGHT,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          background: DIALOGUE_PLACEMENT_INTERVIEW_STILL_LETTERBOX,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-dialogue-placement-still="true"
          src={DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC}
          alt=""
          width={1920}
          height={888}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </div>
      <DialoguePlayerControlBar height={PLACEMENT_PLAYER_CONTROL_HEIGHT} />
    </div>
  );
}
