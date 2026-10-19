import { DM_Mono, DM_Sans } from "next/font/google";

export const dialogueSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dialogue-sans",
  display: "swap",
});

export const dialogueMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dialogue-mono",
  display: "swap",
});
