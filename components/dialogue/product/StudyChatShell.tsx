import type { ReactNode } from "react";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  children: ReactNode;
  compact?: boolean;
  hero?: boolean;
  /** @deprecated Anatomy targets live on answer parts, not the chat head. */
  anatomy?: boolean;
}

export default function StudyChatShell({ children, compact, hero }: Props) {
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
      <div className="dp-study-chat__head">
        <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
        <p className="dp-study-chat__sub">{dialogueCopy.studySubtitle}</p>
      </div>
      <div className="dp-study-chat__scroll">
        <div className="dp-study-chat__body">{children}</div>
      </div>
    </div>
  );
}
