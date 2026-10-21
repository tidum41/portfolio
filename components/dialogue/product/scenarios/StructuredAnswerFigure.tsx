import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import ClipCard from "@/components/dialogue/product/ClipCard";
import { CHECKOUT_QUESTION, CLIPS } from "@/lib/dialogue/product/sampleData";

type Props = {
  showClips?: boolean;
  compact?: boolean;
};

export default function StructuredAnswerFigure({ showClips = true, compact }: Props) {
  return (
    <StudyChatShell compact={compact}>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart compact={compact} />
      {showClips && <ClipCard clip={CLIPS[0]} />}
      <SourcesRow />
      {!compact && <FollowUpChips />}
    </StudyChatShell>
  );
}
