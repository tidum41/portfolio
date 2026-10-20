import { DIALOGUE_GRAPHICS_COLORS } from "@/lib/caseStudies/dialogueGraphicsTheme";

/** Magenta launcher with Dialogue sparkle mark (matches approved placement graphics). */
export function DialogueChatLauncher({ size = 52 }: { size?: number }) {
  const sparkle = Math.round(size * 0.34);
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
        boxShadow: "0 6px 18px rgba(217, 70, 143, 0.28)",
      }}
    >
      <svg width={sparkle} height={sparkle} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2.5 14.2 9.5 21 10.8 15.5 15.2 16.8 22 12 18.4 7.2 22 8.5 15.2 3 10.8 9.8 9.5 12 2.5Z"
          fill="white"
        />
        <path
          d="M17.8 4.2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1Z"
          fill="white"
          opacity={0.95}
        />
      </svg>
    </div>
  );
}
