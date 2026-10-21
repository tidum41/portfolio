import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

/** Short answer that ends on the interview footnote (placement bubble). */
export default function PlacementChatPreview() {
  return (
    <StudyChatShell compact>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart hero showFootnote={false} />
    </StudyChatShell>
  );
}
