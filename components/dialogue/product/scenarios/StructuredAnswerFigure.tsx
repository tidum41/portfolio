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
  anatomy?: boolean;
};

export default function StructuredAnswerFigure({
  showClips = true,
  compact,
  hero,
  anatomy,
}: Props) {
  const shellCompact = compact || hero;

  if (anatomy) {
    return (
      <StudyChatShell compact={shellCompact}>
        <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
        <QuerySearchStep searched={24} found={9} />
        <div data-anatomy-part="sources">
          <SourcesRow />
        </div>
        <FunnelChart compact={compact} hero={hero} showFootnote anatomy />
        {showClips && (
          <div data-anatomy-part="clips">
            <ClipCard clip={CLIPS[0]} />
          </div>
        )}
        {!compact && (
          <div data-anatomy-part="followups">
            <FollowUpChips />
          </div>
        )}
      </StudyChatShell>
    );
  }

  return (
    <StudyChatShell compact={shellCompact} hero={hero}>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart compact={compact} hero={hero} showFootnote />
      {showClips && !hero && <ClipCard clip={CLIPS[0]} />}
      {!hero && <SourcesRow />}
      {!compact && !hero && <FollowUpChips />}
    </StudyChatShell>
  );
}
