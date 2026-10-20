import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { EvidenceAnswerCard } from "@/components/dialogue/graphics/EvidenceAnswerCard";

export function DialogueResearchAssistantPanel({ compact }: { compact: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        color: DIALOGUE_GRAPHICS_COLORS.ink,
      }}
    >
      <header style={{ padding: compact ? "12px 12px 10px" : "14px 14px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Research assistant
        </div>
        <div style={{ marginTop: 3, fontSize: compact ? 11 : 12, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
          Checkout usability, 24 interviews
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: compact ? "0 10px 10px" : "0 12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            background: DIALOGUE_GRAPHICS_COLORS.bubble,
            borderRadius: 12,
            padding: compact ? "10px 12px" : "11px 13px",
            fontSize: compact ? 11 : 12,
            lineHeight: 1.45,
            color: DIALOGUE_GRAPHICS_COLORS.ink,
            flexShrink: 0,
          }}
        >
          Where did people drop off in checkout?
        </div>

        <div
          style={{
            border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            fontSize: compact ? 10 : 11,
            color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span>Searched 24 interviews, found 9 relevant moments</span>
          <span style={{ color: DIALOGUE_GRAPHICS_COLORS.inkSoft, fontSize: 9 }}>▼</span>
        </div>

        <div style={{ flexShrink: 0 }}>
          <EvidenceAnswerCard compact={compact} />
        </div>
      </div>
    </div>
  );
}
