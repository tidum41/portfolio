import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

export function DialogueInterviewPlayer({ compact = false }: { compact?: boolean }) {
  const height = compact ? 124 : 168;
  return (
    <div
      style={{
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        background: DIALOGUE_GRAPHICS_COLORS.studyBlock,
        position: "relative",
        height,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dialogue/placement-player-blur.webp"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(0.5px) saturate(0.92)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(26,24,22,0.02) 0%, rgba(26,24,22,0.08) 55%, rgba(26,24,22,0.35) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderLeft: `11px solid ${DIALOGUE_GRAPHICS_COLORS.ink}`,
            marginLeft: 2,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>14:03</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>Jordan M.</span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.25)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "58%",
              height: "100%",
              borderRadius: 2,
              background: DIALOGUE_GRAPHICS_COLORS.accent,
            }}
          />
        </div>
      </div>
    </div>
  );
}
