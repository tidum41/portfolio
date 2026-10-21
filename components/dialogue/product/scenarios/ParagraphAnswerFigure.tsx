import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { CHECKOUT_QUESTION, PARAGRAPH_ANSWER } from "@/lib/dialogue/product/sampleData";

export default function ParagraphAnswerFigure() {
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <div className="dp-text-prose-sm" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PARAGRAPH_ANSWER.map((p) => (
          <p key={p.slice(0, 24)} style={{ margin: 0 }}>{p}</p>
        ))}
      </div>
    </StudyChatShell>
  );
}
