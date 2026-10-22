import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";

/** Quote frame: restored interview player with the synced transcript underneath. */
export default function QuoteFrameFigure() {
  return (
    <div className="dp-quote-frame dialogue-product-root dp-chat-panel-typography">
      <DialogueInterviewPlayer />
      <SyncedTranscript />
    </div>
  );
}
