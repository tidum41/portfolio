import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import SourcesScaleRow from "@/components/dialogue/product/scenarios/SourcesScaleRow";
import { CHECKOUT_FUNNEL } from "@/lib/dialogue/product/sampleData";

/** The outline's hero question for the checkout study. */
export const HERO_QUESTION = "What slowed people down at checkout?";

/** Round N hero chat card: the question, a one-sentence answer, and one row
    of source avatars. The count bar lives in the Counts section only. */
export default function HeroChatCard({ composer = true }: { composer?: boolean }) {
  const [before, after] = CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis);
  return (
    <StudyChatShell compact hideComposer={!composer}>
      <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        {before}
        <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
        {after}
      </p>
      <SourcesScaleRow />
    </StudyChatShell>
  );
}
