import { dialogueCopy } from "@/components/dialogue/product/tokens";

/** Decorative study-chat composer (t384 measurements). Not interactive in figures. */
export default function ChatComposer() {
  return (
    <div className="dp-study-chat__composer" data-export-chat-composer="true" data-annotate-part="composer">
      <div className="dp-study-chat__composer-box">
        <p className="dp-study-chat__composer-placeholder">
          {dialogueCopy.composerPlaceholder}
        </p>
        <span className="dp-study-chat__composer-send" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 12.5V3.5M8 3.5L3.5 8M8 3.5L12.5 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
