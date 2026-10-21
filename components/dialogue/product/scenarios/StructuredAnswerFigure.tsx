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
  hero?: boolean;
};

export default function StructuredAnswerFigure({
  showClips = true,
  compact,
  hero,
}: Props) {
  return (
    <StudyChatShell compact={compact || hero} hero={hero}>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart compact={compact} hero={hero} showFootnote />
      {showClips && !hero && <ClipCard clip={CLIPS[0]} />}
      {!hero && <SourcesRow />}
      {!compact && !hero && <FollowUpChips />}
    </StudyChatShell>
  );
}
