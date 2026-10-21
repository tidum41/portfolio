import { DM_Sans, Zilla_Slab } from "next/font/google";

/**
 * Shared next/font loaders for Dialogue product UI.
 * Apply `.className` on figure roots so DM Sans resolves even when a node
 * is outside `.dialogue-case-study-root` (clones, parity hosts, portals).
 * `@font-face` is document-global once this module is imported from layout.
 */
export const dialogueDmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dialogue-dm-sans",
  display: "swap",
});

export const dialogueZillaSlab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-dialogue-zilla",
  display: "swap",
});

/** Class names to put on any Dialogue product root that must paint DM Sans. */
export const dialogueProductFontClassName = [
  dialogueDmSans.variable,
  dialogueDmSans.className,
  dialogueZillaSlab.variable,
].join(" ");
