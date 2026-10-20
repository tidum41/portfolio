import type { ReactNode } from "react";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Plain derived footer with full-bleed hairline (matches section-imperfect cards). */
export function DerivedEvidenceLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${DIALOGUE_GRAPHICS_COLORS.footerHairline}`,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        padding: "10px 14px",
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
