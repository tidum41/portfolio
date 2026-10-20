import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { DialogueStudyTranscript } from "@/components/dialogue/DialogueStudyTranscript";

/** Study-page chrome shared by docked and floating placement tiles. */
export function DialogueStudyHostPage({
  reserveRightForFloatingChat = false,
}: {
  reserveRightForFloatingChat?: boolean;
}) {
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
          padding: "12px 16px",
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: DIALOGUE_GRAPHICS_COLORS.ink,
              letterSpacing: "-0.02em",
            }}
          >
            Checkout usability Q3
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
            Session 12, 24 interviews
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
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
                fontWeight: 500,
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </header>

      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        }}
      >
        <DialogueInterviewPlayer />
      </div>

      <DialogueStudyTranscript reserveRightForFloatingChat={reserveRightForFloatingChat} />
    </div>
  );
}
