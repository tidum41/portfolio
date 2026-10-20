import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Study-page chrome shared by docked and floating placement tiles. */
export function DialogueStudyHostPage({
  reserveRightForFloatingChat = false,
}: {
  reserveRightForFloatingChat?: boolean;
}) {
  const barMaxWidth = reserveRightForFloatingChat ? "52%" : undefined;
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
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
          gap: 12,
          padding: "14px 18px",
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DIALOGUE_GRAPHICS_COLORS.ink,
              letterSpacing: "-0.02em",
            }}
          >
            Checkout usability study
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
            Session 12, 24 interviews
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Clips", "Transcript", "Notes"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 10,
                padding: "4px 8px",
                borderRadius: 999,
                background: i === 1 ? DIALOGUE_GRAPHICS_COLORS.bubble : "transparent",
                color: i === 1 ? DIALOGUE_GRAPHICS_COLORS.ink : DIALOGUE_GRAPHICS_COLORS.inkSoft,
                border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </header>

      <div
        style={{
          padding: "14px 18px 12px",
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        }}
      >
        <div
          style={{
            height: 168,
            borderRadius: 10,
            background: `linear-gradient(180deg, ${DIALOGUE_GRAPHICS_COLORS.studyBlock} 0%, ${DIALOGUE_GRAPHICS_COLORS.surfaceMuted} 100%)`,
            border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "rgba(255,255,255,0.85)",
              border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 14,
              bottom: 10,
              fontSize: 10,
              color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
            }}
          >
            14:03, Jordan M.
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "12px 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { speaker: "Jordan M.", time: "13:58", width: "92%" },
          { speaker: "Moderator", time: "14:01", width: "78%" },
          { speaker: "Jordan M.", time: "14:03", width: "88%" },
          { speaker: "Jordan M.", time: "14:06", width: "70%" },
          { speaker: "Moderator", time: "14:09", width: "82%" },
        ].map((row) => (
          <div key={`${row.speaker}-${row.time}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span
              style={{
                width: 52,
                flexShrink: 0,
                fontSize: 10,
                color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
                paddingTop: 3,
              }}
            >
              {row.time}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: DIALOGUE_GRAPHICS_COLORS.inkMuted, marginBottom: 3 }}>
                {row.speaker}
              </div>
              <div
                style={{
                  height: 8,
                  width: row.width,
                  maxWidth: barMaxWidth,
                  borderRadius: 4,
                  background: DIALOGUE_GRAPHICS_COLORS.studyLine,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
