import type { ReactNode } from "react";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

export function DerivedEvidenceLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        marginLeft: -14,
        marginRight: -14,
        marginBottom: -14,
        padding: "10px 14px",
        borderTop: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
        borderRadius: "0 0 12px 12px",
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        fontSize: 11,
        lineHeight: 1.35,
        color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </div>
  );
}
