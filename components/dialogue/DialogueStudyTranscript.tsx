import { PLACEMENT_TRANSCRIPT_MAX_WIDTH_FLOATING } from "@/lib/caseStudies/dialoguePlacementExport";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import {
  PLACEMENT_AVATAR_SIZE,
  PLACEMENT_GRID_PAD_X,
  PLACEMENT_ICON_SIZE,
  PLACEMENT_RADIUS_SM,
  PLACEMENT_SPACE_1,
  placementType,
} from "@/lib/caseStudies/dialoguePlacementTypography";
import { DialogueSparkleIcon } from "@/components/dialogue/graphics/DialogueIcons";
import { PlacementParticipantAvatar } from "@/components/dialogue/graphics/PlacementParticipantAvatar";

type Line = {
  speaker: string;
  time: string;
  text: string;
  kind: "dialogue" | "participant";
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
    text: "The apartment field kept clearing on autocomplete, and I almost closed the tab.",
  },
  {
    kind: "dialogue",
    speaker: "Dialogue",
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

function SpeakerMeta({ speaker, time }: { speaker: string; time: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        marginBottom: 2,
        ...placementType.meta,
        color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
      }}
    >
      <span style={{ fontWeight: 500, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>{speaker}</span>
      <span style={{ ...placementType.tabular, fontWeight: 400 }}>{time}</span>
    </div>
  );
}

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
        padding: `${PLACEMENT_SPACE_1}px ${PLACEMENT_GRID_PAD_X}px ${PLACEMENT_GRID_PAD_X}px`,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        data-placement-crop="transcript"
        data-placement-proof-text="true"
        style={{
          maxWidth: reserveRightForFloatingChat ? PLACEMENT_TRANSCRIPT_MAX_WIDTH_FLOATING : "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: PLACEMENT_SPACE_1,
            gap: PLACEMENT_SPACE_1,
          }}
        >
          <span style={{ ...placementType.label, color: DIALOGUE_GRAPHICS_COLORS.ink }}>Transcript</span>
          <span
            style={{
              ...placementType.labelRegular,
              color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
              flexShrink: 0,
            }}
          >
            Copy
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LINES.map((line) => (
            <div
              key={`${line.speaker}-${line.time}`}
              style={{
                display: "flex",
                gap: PLACEMENT_SPACE_1,
                alignItems: "flex-start",
                padding: line.highlight ? `${PLACEMENT_SPACE_1}px 10px` : "2px 0",
                borderRadius: line.highlight ? PLACEMENT_RADIUS_SM : 0,
                background: line.highlight ? DIALOGUE_GRAPHICS_COLORS.bubble : "transparent",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: PLACEMENT_AVATAR_SIZE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 2,
                }}
              >
                {line.kind === "dialogue" ? (
                  <DialogueSparkleIcon size={PLACEMENT_ICON_SIZE} />
                ) : (
                  <PlacementParticipantAvatar variant="jordan" size={PLACEMENT_AVATAR_SIZE} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SpeakerMeta speaker={line.speaker} time={line.time} />
                <div
                  style={{
                    ...placementType.body,
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
    </div>
  );
}
