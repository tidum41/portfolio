import { DIALOGUE_PLACEMENT_MARK_SRC } from "@/lib/caseStudies/dialoguePlacementAssets";
import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";

export function DialogueSparkleIcon({ size = 14 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={DIALOGUE_PLACEMENT_MARK_SRC}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, display: "block", objectFit: "contain" }}
    />
  );
}

export function ShareExportIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.5v7M8 2.5 5.5 5M8 2.5 10.5 5M3.5 9v4.5h9V9"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkMuted}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3 4.5 6 7.5 9 4.5"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkSoft}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CounterEvidenceIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 4h9v7.5H6.2L4 13.5V4Z"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkMuted}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 7h5M5.5 9h3.2"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkSoft}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
