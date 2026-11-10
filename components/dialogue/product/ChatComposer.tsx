import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";

/** Decorative study-chat composer (Paper section-6a). Not interactive in figures. */
export default function ChatComposer({ text }: { text?: string } = {}) {
  return (
    <div className="dp-study-chat__composer" data-export-chat-composer="true" data-annotate-part="composer">
      <div className="dp-study-chat__composer-box" data-annotate-part="composer-box">
        <p className={text ? "dp-study-chat__composer-text" : "dp-study-chat__composer-placeholder"}>
          {text ?? dialogueCopy.composerPlaceholder}
        </p>
        <span className="dp-study-chat__composer-send" aria-hidden data-annotate-part="composer-send">
          <ArrowUpIcon />
        </span>
      </div>
    </div>
  );
}
