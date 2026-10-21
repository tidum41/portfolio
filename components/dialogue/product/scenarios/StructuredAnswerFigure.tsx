import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
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

  // Composer stays on hero + anatomy (part 5 context). Hidden on option thumbnails.
  const hideComposer = !hero && !anatomy;

  if (anatomy) {
    return (
      <StudyChatShell compact={shellCompact} hideComposer>
        <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
        <QuerySearchStep searched={24} found={9} />
        <FunnelChart
          compact={compact}
          hero={hero}
          showLargestDrop={false}
          vizCard={false}
          anatomy
          showChart={false}
        />
        <div className="dp-anatomy-target" data-anatomy-part="sources">
          <span className="dp-anatomy-part-marker" aria-hidden>
            2
          </span>
          <SourcesRow selectedParticipant="Priya K." selectedTime="15:47" />
        </div>
        <FunnelChart compact={compact} hero={hero} showLargestDrop vizCard={!hero} anatomy showSummary={false} />
        {showClips && (
          <div className="dp-anatomy-target" data-anatomy-part="clips">
            <span className="dp-anatomy-part-marker" aria-hidden>
              4
            </span>
            <ClipThumbnails selectedTime="15:47" />
          </div>
        )}
        {!compact && (
          <div className="dp-anatomy-target" data-anatomy-part="followups">
            <span className="dp-anatomy-part-marker" aria-hidden>
              5
            </span>
            <FollowUpChips />
          </div>
        )}
      </StudyChatShell>
    );
  }

  return (
    <StudyChatShell compact={shellCompact} hero={hero} hideComposer={hideComposer}>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart compact={compact} hero={hero} vizCard={!hero} />
      {showClips && !hero && <ClipThumbnails selectedTime="15:47" />}
      {showClips && hero && <ClipCard clip={CLIPS[0]} />}
      {!hero && <SourcesRow selectedParticipant="Priya K." selectedTime="15:47" />}
      {!compact && !hero && <FollowUpChips />}
    </StudyChatShell>
  );
}
