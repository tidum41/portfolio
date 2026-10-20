import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { EvidenceAnswerCard } from "@/components/dialogue/graphics/EvidenceAnswerCard";
import { ChevronDownIcon } from "@/components/dialogue/graphics/DialogueIcons";

export function DialogueResearchAssistantPanel({
  compact,
  floating = false,
}: {
  compact: boolean;
  floating?: boolean;
}) {
  const fillHeight = compact && !floating;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: fillHeight ? "100%" : "auto",
        minHeight: fillHeight ? 0 : undefined,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        color: DIALOGUE_GRAPHICS_COLORS.ink,
      }}
    >
      <header style={{ padding: compact ? "11px 12px 8px" : "14px 14px 10px", flexShrink: 0 }}>
        <div style={{ fontSize: compact ? 12 : 14, fontWeight: 500, letterSpacing: "-0.02em" }}>
          Research assistant
        </div>
        <div style={{ marginTop: 3, fontSize: compact ? 10 : 12, color: DIALOGUE_GRAPHICS_COLORS.inkSoft }}>
          Checkout usability, 24 interviews
        </div>
      </header>

      <div
        style={{
          flex: fillHeight ? 1 : undefined,
          minHeight: fillHeight ? 0 : undefined,
          padding: compact ? "0 10px 10px" : "0 12px 12px",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 8 : 10,
          overflow: floating ? "visible" : fillHeight ? "auto" : "hidden",
        }}
      >
        <div
          style={{
            background: DIALOGUE_GRAPHICS_COLORS.bubble,
            borderRadius: 12,
            padding: compact ? "9px 11px" : "11px 13px",
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
            borderRadius: 10,
            padding: compact ? "7px 9px" : "8px 10px",
            fontSize: compact ? 10 : 11,
            color: DIALOGUE_GRAPHICS_COLORS.inkMuted,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            lineHeight: 1.35,
          }}
        >
          <span>Searched 24 interviews, found 9 relevant moments</span>
          <ChevronDownIcon />
        </div>

        <div style={{ flexShrink: 0, minHeight: 0 }}>
          <EvidenceAnswerCard compact={compact} />
        </div>
      </div>
    </div>
  );
}
