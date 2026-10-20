import {
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
import { PLACEMENT_RADIUS_MD } from "@/lib/caseStudies/dialoguePlacementTypography";

/** Match docked study column so cover crop is identical in floating + docked tiles. */
const PLACEMENT_PLAYER_BODY_WIDTH = PLACEMENT_STUDY_WIDTH_DOCKED - STUDY_PLAYER_PAD_X * 2;

const PLAY_BUTTON_SIZE = 40;

/** Blurred interview still + static play affordance (no control bar). */
export function DialogueInterviewPlayer() {
  return (
    <div
      data-placement-crop="player"
      style={{
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        borderRadius: PLACEMENT_RADIUS_MD,
        overflow: "hidden",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
        background: "#161412",
        position: "relative",
        width: PLACEMENT_PLAYER_BODY_WIDTH,
        maxWidth: "100%",
        height: PLACEMENT_PLAYER_TOTAL_HEIGHT,
      }}
    >
      <div
        style={{
          height: PLACEMENT_PLAYER_VIDEO_HEIGHT,
          position: "relative",
          overflow: "hidden",
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
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: PLAY_BUTTON_SIZE,
              height: PLAY_BUTTON_SIZE,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.22)",
              border: "1px solid rgba(255, 255, 255, 0.38)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.18)",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M5.2 3.8v6.4L10.4 7 5.2 3.8Z"
                fill="white"
                fillOpacity={0.95}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
