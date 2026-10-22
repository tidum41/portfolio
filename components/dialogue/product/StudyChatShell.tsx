import type { ReactNode } from "react";
import ChatComposer from "@/components/dialogue/product/ChatComposer";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

type Props = {
  children: ReactNode;
  compact?: boolean;
  hero?: boolean;
  /** Hide bottom composer (rare; default shows t384 chrome). */
  hideComposer?: boolean;
  /** Drop the repeated study-chat title row when the chart is the point. */
  hideHeader?: boolean;
  /** @deprecated Anatomy targets live on answer parts, not the chat head. */
  anatomy?: boolean;
};

export default function StudyChatShell({
  children,
  compact,
  hero,
  hideComposer,
  hideHeader,
}: Props) {
  return (
    <div
      className={[
        "dp-study-chat",
        dialogueProductFontClassName,
        hero ? "dp-study-chat--hero" : "",
        compact ? "dp-study-chat--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-export-chat-panel="true"
    >
      {hideHeader ? null : (
        <div className="dp-study-chat__head">
          <div className="dp-study-chat__head-top">
            <div className="dp-study-chat__head-text">
              <div className="dp-study-chat__title-row">
                <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
                <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
              </div>
              <p className="dp-study-chat__sub">{dialogueCopy.studySubtitle}</p>
            </div>
            <span className="dp-study-chat__minimize" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8H12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      )}
      <div className="dp-study-chat__scroll">
        <div className="dp-study-chat__body">{children}</div>
      </div>
      {!hideComposer ? <ChatComposer /> : null}
    </div>
  );
}
