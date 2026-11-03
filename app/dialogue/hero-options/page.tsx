import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { HeroSelection, type HeroOpt } from "@/components/dialogue/live/DialogueMotionStage";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Hero options: tying a quote to its segment", robots: { index: false } };

const OPTIONS: { id: HeroOpt; name: string; line: string }[] = [
  { id: "a", name: "A. Head line and rows", line: "The 225 keeps its fill and the 75 steps down. A head line with the segment swatch names the group, and each person gets a row with their own timestamp." },
  { id: "b", name: "B. Head line, pills, one row", line: "Same fill and head line. Source pills for Ana, Dev and the rest of the 225 sit above Ana's row, with Ana's pill selected, so other timestamps are one tap away." },
  { id: "c", name: "C. Group chip, row, pills", line: "No head line. A selected pill names the group with its swatch, then Ana's row, then pills for the other people in it." },
];

/** Dev only. The three end states of the hero take after the shopper taps the 225, side by side. */
export default function Page() {
  return (
    <main className="dlg-hero-options dialogue-product-root dp-chat-panel-typography">
      {OPTIONS.map((o) => (
        <section key={o.id} id={`opt-${o.id}`} className="dlg-hero-options__col">
          <p className="dlg-hero-options__name">{o.name}</p>
          <div className={["dp-study-chat dlg-live dlg-live--bare dlg-stage dlg-hero-options__panel", dialogueProductFontClassName].join(" ")} data-demo="hero">
            <div className="dlg-stage__body">
              <UserMessageBubble>How do shoppers read &lsquo;Arrives by Friday&rsquo;?</UserMessageBubble>
              <AnswerCard segment={false} sideOpen="friday" still />
              <HeroSelection opt={o.id} />
            </div>
          </div>
          <p className="dlg-stress__tag">{o.line}</p>
        </section>
      ))}
    </main>
  );
}
