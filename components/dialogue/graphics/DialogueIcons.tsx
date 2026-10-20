import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";

export function DialogueSparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.2 9.1 5.2l4 .6-2.9 2.7.7 3.9L8 10.4 4.1 12.4l.7-3.9L2 5.8l4-.6L8 1.2Z"
        fill={DIALOGUE_GRAPHICS_COLORS.accent}
      />
    </svg>
  );
}

export function ParticipantAvatarIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#ECE7E1" stroke="#E4DFD8" strokeWidth="1" />
      <circle cx="12" cy="10" r="3.2" fill="#B8B0A6" />
      <path
        d="M6.2 18.2c.8-2.4 2.8-3.8 5.8-3.8s5 1.4 5.8 3.8"
        stroke="#B8B0A6"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
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
