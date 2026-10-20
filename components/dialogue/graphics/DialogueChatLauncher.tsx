import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Magenta launcher with sparkle chat mark (matches case-study graphics, not a bag icon). */
export function DialogueChatLauncher({ size = 52 }: { size?: number }) {
  const icon = Math.round(size * 0.46);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: DIALOGUE_GRAPHICS_COLORS.accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5.5 10.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v.5H5.5v-.5Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M4.5 11.2h15v5.8a2.2 2.2 0 0 1-2.2 2.2H9.4l-3.2 2.4v-2.4a2.2 2.2 0 0 1-1.7-2.1v-5.9Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8.3 14.4h.01M11.1 14.4h.01M13.9 14.4h.01"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17.6 4.4 18.4 6l1.8.3-1.3 1.2.4 1.8-1.6-.9-1.6.9.4-1.8-1.3-1.2 1.8-.3.8-1.6Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
