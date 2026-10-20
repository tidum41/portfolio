import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { DialogueSparkleIcon, ParticipantAvatarIcon } from "@/components/dialogue/graphics/DialogueIcons";

type Line = {
  speaker: string;
  time: string;
  text: string;
  kind: "dialogue" | "participant" | "moderator";
  highlight?: boolean;
};

const LINES: Line[] = [
  {
    kind: "dialogue",
    speaker: "Dialogue",
    time: "13:54",
    text: "Walk me through what happened at checkout.",
  },
  {
    kind: "participant",
    speaker: "Jordan M.",
    time: "13:58",
    text: "The apartment field kept clearing when I picked autocomplete, and I almost closed the tab.",
  },
  {
    kind: "moderator",
    speaker: "Moderator",
    time: "14:01",
    text: "What did you try next?",
  },
  {
    kind: "participant",
    speaker: "Jordan M.",
    time: "14:03",
    text: "I retyped the whole address twice before it stuck.",
    highlight: true,
  },
];

export function DialogueStudyTranscript({
  reserveRightForFloatingChat = false,
}: {
  reserveRightForFloatingChat?: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        padding: "10px 16px 14px",
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, color: DIALOGUE_GRAPHICS_COLORS.ink }}>Transcript</span>
        <span style={{ fontSize: 10, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>Copy</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxWidth: reserveRightForFloatingChat ? "54%" : "100%",
        }}
      >
        {LINES.map((line) => (
          <div
            key={`${line.speaker}-${line.time}`}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              padding: line.highlight ? "8px 10px" : "4px 2px",
              borderRadius: line.highlight ? 8 : 0,
              background: line.highlight ? DIALOGUE_GRAPHICS_COLORS.bubble : "transparent",
            }}
          >
            <div style={{ flexShrink: 0, paddingTop: 1 }}>
              {line.kind === "dialogue" ? (
                <DialogueSparkleIcon size={13} />
              ) : (
                <ParticipantAvatarIcon size={20} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
                  marginBottom: 2,
                }}
              >
                {line.speaker} {line.time}
              </div>
              <div
                style={{
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: line.highlight ? DIALOGUE_GRAPHICS_COLORS.ink : DIALOGUE_GRAPHICS_COLORS.inkMuted,
                }}
              >
                {line.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
