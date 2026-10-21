import type { ReactNode } from "react";
import { DM_Sans, Zilla_Slab } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dialogue-dm-sans",
  display: "swap",
});

const zillaSlab = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-dialogue-zilla",
  display: "swap",
});

export default function DialogueLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`dialogue-case-study-root ${dmSans.variable} ${zillaSlab.variable}`}>
      {children}
    </div>
  );
}
