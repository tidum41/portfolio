import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuoteCard from "@/components/dialogue/product/QuoteCard";
import { CLIPS, COVERAGE_ADDRESS } from "@/lib/dialogue/product/sampleData";

/** The hero question for the checkout study. */
export const HERO_QUESTION = "What slowed people down at checkout?";

/** Round O hero chat card: the question, the answer with its count as text,
    and one grey quote card. The bar lives in the Counts section only. */
export default function HeroChatCard({ composer = true }: { composer?: boolean }) {
  return (
    <StudyChatShell compact hideComposer={!composer}>
      <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
      <p className="dp-summary dp-text-body" data-annotate-part="summary">
        {COVERAGE_ADDRESS.headline}
      </p>
      <QuoteCard name={CLIPS[0].participant} time="14:03" text={CLIPS[0].transcript} />
    </StudyChatShell>
  );
}
