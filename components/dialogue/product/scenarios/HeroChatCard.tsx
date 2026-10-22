import FunnelChart from "@/components/dialogue/product/FunnelChart";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";

/** Compact study chat for the hero collage (no clips drawer). */
export default function HeroChatCard() {
  return (
    <StudyChatShell compact hideComposer hero>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <FunnelChart compact showLargestDrop={false} vizCard />
    </StudyChatShell>
  );
}
