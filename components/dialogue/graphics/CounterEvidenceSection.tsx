import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { ChevronDownIcon, CounterEvidenceIcon } from "./DialogueIcons";

export function CounterEvidenceSection({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        paddingTop: compact ? 8 : 10,
        marginTop: compact ? 8 : 10,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <CounterEvidenceIcon size={compact ? 13 : 14} />
        <span
          style={{
            fontSize: compact ? 10 : 11,
            fontWeight: 500,
            color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
          }}
        >
          Counter evidence
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: compact ? "7px 9px" : "8px 10px",
          borderRadius: 8,
          background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
          border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        }}
      >
        <span style={{ fontSize: compact ? 10 : 11, color: DIALOGUE_GRAPHICS_COLORS.ink, lineHeight: 1.35 }}>
          3 had no trouble with address
        </span>
        <ChevronDownIcon />
      </div>
    </div>
  );
}
