import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import {
  CHECKOUT_QUESTION,
  PARAGRAPH_ANSWER,
  PARAGRAPH_ANSWER_BRIEF,
} from "@/lib/dialogue/product/sampleData";

export default function ParagraphAnswerFigure({ focus }: { focus?: "answer" }) {
  const paragraphs = focus === "answer" ? PARAGRAPH_ANSWER_BRIEF : PARAGRAPH_ANSWER_BRIEF;
  const prose = (
    <div
      className={focus === "answer" ? "dp-text-prose-sm" : "dp-text-prose-sm dp-text-prose-light"}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {paragraphs.map((p) => (
        <p key={p.slice(0, 24)} style={{ margin: 0 }}>{p}</p>
      ))}
    </div>
  );
  if (focus === "answer") return prose;
  return (
    <StudyChatShell hideComposer>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      {prose}
    </StudyChatShell>
  );
}
