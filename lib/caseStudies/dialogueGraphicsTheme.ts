/** Shared tokens for Dialogue case-study UI graphics (matches section-imperfect / section-share). */

export const DIALOGUE_GRAPHICS_FONT =
  'var(--font-sans), "Helvetica Neue", Helvetica, Arial, sans-serif';

export const DIALOGUE_GRAPHICS_COLORS = {
  ink: "#1A1816",
  inkMuted: "#6B6560",
  inkSoft: "#8A847C",
  border: "#E4DFD8",
  borderSubtle: "#EDE9E4",
  /** Derived-evidence footer hairline (section-imperfect) */
  footerHairline: "#EEE9E2",
  surface: "#FFFFFF",
  surfaceMuted: "#F7F4F0",
  bubble: "#F3EDE4",
  accent: "#D9468F",
  barTrack: "#E7E2DC",
  barNeutral: "#C9C2B8",
  barMuted: "#B8B0A6",
  studyChrome: "#FAFAF9",
  studyLine: "#ECE7E1",
  studyBlock: "#F0ECE7",
} as const;
