import {
  PLACEMENT_LAYOUT_WIDTH,
  PLACEMENT_SIDEBAR_WIDTH,
  STUDY_PLAYER_PAD_X,
} from "@/lib/caseStudies/dialoguePlacementExport";
import {
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_LETTERBOX,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH,
} from "@/lib/caseStudies/dialoguePlacementStill";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_RADIUS_MD } from "@/lib/caseStudies/dialoguePlacementTypography";

const PLAY_BUTTON_SIZE = 56;
const PLAY_GLYPH_SIZE = 18;

function placementPlayerDimensions() {
  const bodyWidth = PLACEMENT_LAYOUT_WIDTH - PLACEMENT_SIDEBAR_WIDTH - STUDY_PLAYER_PAD_X * 2;
  const videoHeight = Math.round((bodyWidth * DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT) / DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH);
  return { bodyWidth, videoHeight };
}

/** Blurred interview still + static play affordance (no control bar). */
export function DialogueInterviewPlayer() {
  const { bodyWidth } = placementPlayerDimensions();
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
        width: bodyWidth,
        maxWidth: "100%",
        aspectRatio: `${DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH} / ${DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT}`,
      }}
    >
      <div
        style={{
          height: "100%",
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
          data-face-blur="true"
          style={{
            position: "absolute",
            left: "73.8%",
            top: "48.3%",
            width: "20.1%",
            height: "28.7%",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
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
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.28)",
            }}
          >
            <svg
              width={PLAY_GLYPH_SIZE}
              height={PLAY_GLYPH_SIZE}
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
              style={{ marginLeft: 2 }}
            >
              <path d="M6.2 4.2v9.6L14.2 9 6.2 4.2Z" fill="#1A1816" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
