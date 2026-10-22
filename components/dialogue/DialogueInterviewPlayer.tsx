import {
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_SRC,
  DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH,
} from "@/lib/caseStudies/dialoguePlacementStill";

const PLAY_BUTTON_SIZE = 56;
const PLAY_GLYPH_SIZE = 18;


/** Blurred interview still + static play affordance (no control bar). */
export function DialogueInterviewPlayer() {
  return (
    <div
      data-placement-crop="player"
      data-annotate-part="player"
      style={{
        fontFamily: "var(--dp-font-family)",
        borderRadius: "var(--dp-radius-card)",
        overflow: "hidden",
        border: "1px solid var(--dp-border)",
        background: "var(--dp-ink)",
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
      }}
    >
      <div
        style={{
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "var(--dp-still-letterbox)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            aspectRatio: `${DIALOGUE_PLACEMENT_INTERVIEW_STILL_WIDTH} / ${DIALOGUE_PLACEMENT_INTERVIEW_STILL_HEIGHT}`,
          }}
        >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-dialogue-placement-still="true"
          data-annotate-part="player-still"
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
          data-annotate-part="player-face-blur"
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
        </div>
        <div
          aria-hidden
          data-annotate-part="player-play-layer"
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
            data-annotate-part="player-play-button"
            style={{
              width: PLAY_BUTTON_SIZE,
              height: PLAY_BUTTON_SIZE,
              borderRadius: "var(--dp-radius-round)",
              background: "color-mix(in srgb, var(--dp-card) 90%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px color-mix(in srgb, var(--dp-black) 28%, transparent)",
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
              <path d="M6.2 4.2v9.6L14.2 9 6.2 4.2Z" fill="var(--dp-ink)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
