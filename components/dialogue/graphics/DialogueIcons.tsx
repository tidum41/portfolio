import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";
import { PLACEMENT_ICON_STROKE } from "@/lib/caseStudies/dialoguePlacementTypography";

/** Dialogue asterisk mark (assistant / brand), not a participant photo. */
export function DialogueAssistantMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 4.2 18.4 12.2 26.2 13.2 19.6 18.2 21.2 26 16 22.2 10.8 26 12.4 18.2 5.8 13.2 13.6 12.2 16 4.2Z"
        fill={DIALOGUE_GRAPHICS_COLORS.accent}
      />
      <path
        d="M4 16.5h9.5"
        stroke={DIALOGUE_GRAPHICS_COLORS.accent}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Waveform tile mark for Dialogue speaker rows in transcript. */
export function DialogueSparkleIcon({ size = 16 }: { size?: number }) {
  const barW = Math.max(1.5, size * 0.14);
  const gap = size * 0.1;
  const heights = [0.45, 0.75, 1, 0.6, 0.85].map((h) => h * size);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
      {heights.map((h, i) => {
        const x = i * (barW + gap) + gap;
        const y = (size - h) / 2;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={barW / 2}
            fill={DIALOGUE_GRAPHICS_COLORS.accent}
          />
        );
      })}
    </svg>
  );
}

export function ShareExportIcon({ size = 16 }: { size?: number }) {
  const sw = PLACEMENT_ICON_STROKE;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.5v7M8 2.5 5.5 5M8 2.5 10.5 5M3.5 9v4.5h9V9"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkMuted}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16 }: { size?: number }) {
  const sw = PLACEMENT_ICON_STROKE;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 6 8 10 12 6"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkSoft}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CounterEvidenceIcon({ size = 16 }: { size?: number }) {
  const sw = PLACEMENT_ICON_STROKE;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 4h9v7.5H6.2L4 13.5V4Z"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkMuted}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <path
        d="M5.5 7h5M5.5 9h3.2"
        stroke={DIALOGUE_GRAPHICS_COLORS.inkSoft}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
