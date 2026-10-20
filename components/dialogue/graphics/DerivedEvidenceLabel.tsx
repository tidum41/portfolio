import type { ReactNode } from "react";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_GRID_PAD_X, PLACEMENT_SPACE_1, placementType } from "@/lib/caseStudies/dialoguePlacementTypography";

/** Plain derived footer with full-bleed hairline (matches section-imperfect cards). */
export function DerivedEvidenceLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${DIALOGUE_GRAPHICS_COLORS.footerHairline}`,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        padding: `${PLACEMENT_SPACE_1 + 2}px ${PLACEMENT_GRID_PAD_X - 4}px`,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        ...placementType.meta,
        color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
      }}
    >
      {children}
    </div>
  );
}
