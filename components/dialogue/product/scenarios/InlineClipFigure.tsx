import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";
import { WaveformIcon } from "@/components/dialogue/product/icons";

/** Round N clips figure: the response row that was tapped (marked), with its
    clip playing inside the answer at 16:9, progress part-way, and the
    synced transcript line highlighted beneath. The quote is the transcript's
    own Marcus W. line at 01:38. */
export default function InlineClipFigure() {
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>Why did people hesitate at payment?</UserMessageBubble>
      <div className="dp-inline-clip__row" data-annotate-part="tapped-response-row">
        <p className="dp-inline-clip__who">
          <WaveformIcon className="dp-inline-clip__wave" />
          <span className="dp-inline-clip__name">Marcus W.</span>
          <span className="dp-inline-clip__time">01:38</span>
          <span className="dp-inline-clip__tap" aria-hidden />
        </p>
        <p className="dp-inline-clip__text">
          When the card failed, I didn&rsquo;t know if it was my bank or the site, so I
          hesitated before retrying.
        </p>
      </div>
      <div className="dp-inline-clip__player" data-annotate-part="inline-player">
        <DialogueInterviewPlayer playing />
        <SyncedTranscript />
      </div>
    </StudyChatShell>
  );
}
