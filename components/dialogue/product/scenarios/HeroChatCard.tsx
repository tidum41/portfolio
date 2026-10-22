import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_FUNNEL, CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

/** Compact study chat for the hero collage (no clips drawer). */
export default function HeroChatCard() {
  const [before, after] = CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis);
  return (
    <StudyChatShell compact hideComposer hero>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <p className="dp-summary dp-text-body">
        {before}
        <span className="dp-summary__emph">{CHECKOUT_FUNNEL.emphasis}</span>
        {after}
      </p>
    </StudyChatShell>
  );
}
