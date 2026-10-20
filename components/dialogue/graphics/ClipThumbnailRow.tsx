import { DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS } from "@/lib/caseStudies/dialoguePlacementAssets";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_RADIUS_SM, PLACEMENT_SPACE_1, placementType } from "@/lib/caseStudies/dialoguePlacementTypography";

const CLIPS = [
  { name: "Jordan M.", time: "14:03", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[0] },
  { name: "Priya K.", time: "15:47", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[1] },
  { name: "Hanna L.", time: "16:02", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[2] },
];

const THUMB_ASPECT = 16 / 10;

export function ClipThumbnailRow({ compact = false, max = 3 }: { compact?: boolean; max?: number }) {
  const shown = CLIPS.slice(0, max);

  return (
    <div
      style={{
        display: "flex",
        gap: PLACEMENT_SPACE_1,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      {shown.map((clip) => (
        <div key={`${clip.name}-${clip.time}`} style={{ flex: "1 1 0", minWidth: 0 }}>
          <div
            style={{
              width: "100%",
              aspectRatio: `${THUMB_ASPECT}`,
              borderRadius: PLACEMENT_RADIUS_SM - 2,
              overflow: "hidden",
              border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.border}`,
              background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={clip.thumb}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                ...placementType.labelRegular,
                color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
                whiteSpace: "nowrap",
              }}
            >
              {clip.name}
            </div>
            <div
              style={{
                ...placementType.meta,
                color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
                ...placementType.tabular,
              }}
            >
              {clip.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
