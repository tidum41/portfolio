import type { ReactNode } from "react";
import {
  dialogueDmSans,
  dialogueZillaSlab,
} from "@/components/dialogue/product/fonts";

export default function DialogueLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`dialogue-case-study-root ${dialogueDmSans.variable} ${dialogueDmSans.className} ${dialogueZillaSlab.variable}`}
    >
      {children}
    </div>
  );
}
