import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CheckIcon } from "@/components/dialogue/product/icons";
import QuoteCardH from "@/components/dialogue/product/hearthside/QuoteCardH";
import { JEN_QUOTE, THIN_PROMPT, THIN_QUESTION } from "@/lib/dialogue/product/hearthside";

/** The thin-data answer and the plan beat in one shell: the answer, the
    stone-500 "Early signal, 2 people" flag where the claim is made, then
    Add to my plan already tapped, with the prompt it copied. No amber, no
    chart, no metrics. */
export default function ThinPlanFigure() {
  return (
    <StudyChatShell compact hideHeader hideComposer subtitle="">
      <UserMessageBubble>{THIN_QUESTION}</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        Two lapsed buyers mentioned that their first order arrived damaged.
      </p>
      <p className="dp-hs-flag" data-annotate-part="thin-flag">
        Early signal, 2 people
      </p>
      <QuoteCardH quote={JEN_QUOTE} part="thin-quote-jen" />
      <div className="dp-next-study-wrap">
        <button
          type="button"
          className="dp-next-study"
          data-interactive
          data-annotate-part="next-study-button"
          title="Copies a prompt to paste into Ask about your study."
          aria-label="Add to my plan. Copies a prompt to paste into Ask about your study."
        >
          <CheckIcon className="dp-next-study__icon" />
          Add to my plan
        </button>
        <p className="dp-next-study__hint" role="status" data-annotate-part="next-study-hint">
          Copied. Paste it into Ask about your study.
        </p>
      </div>
      <div className="dp-hs-prompt" data-annotate-part="copied-prompt">
        {THIN_PROMPT.split("\n\n").map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
    </StudyChatShell>
  );
}
