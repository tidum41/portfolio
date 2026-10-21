import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

/** Placement popup: complete through follow-ups (no bottom crop). */
export default function PlacementChatPreview() {
  return (
    <StudyChatShell compact hero>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart hero showLargestDrop={false} vizCard={false} />
      <FollowUpChips />
    </StudyChatShell>
  );
}
