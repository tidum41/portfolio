import {
  PLACEMENT_PLAYER_ASSET_HEIGHT,
  PLACEMENT_PLAYER_ASSET_WIDTH,
} from "@/lib/caseStudies/dialogueStudyPlacementLayout";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Raster player chrome from approved section-5 (blurred still + real controls). */
export function DialogueInterviewPlayer() {
  return (
    <div
      style={{
        fontFamily: DIALOGUE_GRAPHICS_FONT,
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        background: DIALOGUE_GRAPHICS_COLORS.surface,
        position: "relative",
        width: "100%",
        aspectRatio: `${PLACEMENT_PLAYER_ASSET_WIDTH} / ${PLACEMENT_PLAYER_ASSET_HEIGHT}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dialogue/placement-interview-player.webp"
        alt=""
        width={PLACEMENT_PLAYER_ASSET_WIDTH}
        height={PLACEMENT_PLAYER_ASSET_HEIGHT}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
        }}
      />
    </div>
  );
}
