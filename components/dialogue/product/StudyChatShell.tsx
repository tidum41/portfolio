import type { ReactNode } from "react";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  children: ReactNode;
  compact?: boolean;
  hero?: boolean;
  anatomy?: boolean;
};

export default function StudyChatShell({ children, compact, hero, anatomy }: Props) {
  return (
    <div
      className={[
        "dp-study-chat",
        hero ? "dp-study-chat--hero" : "",
        compact ? "dp-study-chat--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-export-chat-panel="true"
    >
      <div
        className={anatomy ? "dp-study-chat__head dp-anatomy-target" : "dp-study-chat__head"}
        {...(anatomy ? { "data-anatomy-part": "sources" } : {})}
      >
        {anatomy ? <span className="dp-anatomy-part-marker" aria-hidden>1</span> : null}
        <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
        <p className="dp-study-chat__sub">{dialogueCopy.studySubtitle}</p>
      </div>
      <div className="dp-study-chat__scroll">
        <div className="dp-study-chat__body">{children}</div>
      </div>
    </div>
  );
}
