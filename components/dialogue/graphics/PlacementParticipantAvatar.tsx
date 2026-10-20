import { DIALOGUE_PLACEMENT_AVATAR_JORDAN_SRC } from "@/lib/caseStudies/dialoguePlacementAssets";
import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";

export function PlacementParticipantAvatar({
  variant: _variant = "jordan",
  size = 20,
}: {
  variant?: "jordan";
  size?: number;
}) {
  const src = DIALOGUE_PLACEMENT_AVATAR_JORDAN_SRC;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
        border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
        background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
      }}
    />
  );
}
