import type { ReactNode } from "react";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dialogue-dm-sans",
  display: "swap",
});

export default function DialogueLayout({ children }: { children: ReactNode }) {
  return <div className={`dialogue-case-study-root ${dmSans.variable}`}>{children}</div>;
}
