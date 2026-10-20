import { DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS } from "@/lib/caseStudies/dialoguePlacementAssets";
import { DIALOGUE_GRAPHICS_COLORS, DIALOGUE_GRAPHICS_FONT } from "@/lib/caseStudies/dialogueGraphicsTheme";

const CLIPS = [
  { name: "Jordan M.", time: "14:03", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[0] },
  { name: "Priya K.", time: "15:47", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[1] },
  { name: "Hanna L.", time: "16:02", thumb: DIALOGUE_PLACEMENT_CLIP_THUMB_SRCS[2] },
];

export function ClipThumbnailRow({ compact = false, max = 3 }: { compact?: boolean; max?: number }) {
  const shown = CLIPS.slice(0, max);
  const thumbW = compact ? 72 : 80;
  const thumbH = compact ? 44 : 48;

  return (
    <div
      style={{
        display: "flex",
        gap: compact ? 6 : 8,
        fontFamily: DIALOGUE_GRAPHICS_FONT,
      }}
    >
      {shown.map((clip) => (
        <div key={`${clip.name}-${clip.time}`} style={{ flex: "1 1 0", minWidth: 0 }}>
          <div
            style={{
              width: "100%",
              maxWidth: thumbW,
              height: thumbH,
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${DIALOGUE_GRAPHICS_COLORS.borderSubtle}`,
              background: DIALOGUE_GRAPHICS_COLORS.surfaceMuted,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={clip.thumb}
              alt=""
              width={thumbW}
              height={thumbH}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: compact ? 9 : 10,
              color: DIALOGUE_GRAPHICS_COLORS.inkSoft,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {clip.name}, {clip.time}
          </div>
        </div>
      ))}
    </div>
  );
}
