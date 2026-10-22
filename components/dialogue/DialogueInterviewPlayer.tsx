/**
 * Restored from 657337d: 16:9 frame, blurred interview still, 56px white play
 * button, no control bar. The webcam tile keeps an extra heavy blur so no face
 * is recognizable.
 */
const BODY_WIDTH = 312;
const STILL_SRC = "/dialogue/source/interview-frame.png";
const STILL_RATIO = 1920 / 888;
const PLAY_BUTTON_SIZE = 56;
const PLAY_GLYPH_SIZE = 18;
const RADIUS = 10;

export function DialogueInterviewPlayer() {
  return (
    <div
      data-placement-crop="player"
      style={{
        borderRadius: RADIUS,
        overflow: "hidden",
        border: "1px solid #E4DFD8",
        background: "#161412",
        position: "relative",
        width: BODY_WIDTH,
        maxWidth: "100%",
        aspectRatio: "16 / 9",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "#dfdfda",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            aspectRatio: String(STILL_RATIO),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-dialogue-placement-still="true"
            src={STILL_SRC}
            alt=""
            width={1920}
            height={888}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          />
          <div
            aria-hidden
            data-face-blur="true"
            style={{
              position: "absolute",
              left: "73%",
              top: "46%",
              width: "22.5%",
              height: "33%",
              borderRadius: 6,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          />
        </div>
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
            <svg width={PLAY_GLYPH_SIZE} height={PLAY_GLYPH_SIZE} viewBox="0 0 18 18" fill="none" aria-hidden style={{ marginLeft: 2 }}>
              <path d="M6.2 4.2v9.6L14.2 9 6.2 4.2Z" fill="#1A1816" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
