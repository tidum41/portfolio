import { DM_Sans } from "next/font/google";

/** Dialogue product UI font. Loaded once for the homepage Dialogue card
 *  graphic so DM Sans paints instead of portfolio Helvetica. */
export const dialogueDmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dialogue-dm-sans",
  display: "swap",
  preload: false,
});
