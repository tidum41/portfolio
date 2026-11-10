import DialogueChatLive from "@/components/dialogue/live/DialogueChatLive";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Hero option: enlarged answer card", robots: { index: false } };

/** Option only (conflicts with the 640 column lock in TASTE.md): the answered card at 923px, Rachel Chen's hero width, next to the 640 column. */
export default function Page() {
  return (
    <main className="dialogue-product-root dp-chat-panel-typography dlg-hero-opt">
      <section id="opt-640" className="dlg-hero-opt__a">
        <p>A. Current: 640 column</p>
        <div className="dialogue-rachel-frame dialogue-rachel-frame--solution">
          <div className="dlg-hero-opt__panel"><DialogueChatLive height={420} startAnswered /></div>
        </div>
      </section>
      <section id="opt-923" className="dlg-hero-opt__b">
        <p>B. Option: enlarged answer card at 923</p>
        <div className="dialogue-rachel-frame dialogue-rachel-frame--solution">
          <div className="dlg-hero-opt__panel"><DialogueChatLive height={420} startAnswered /></div>
        </div>
      </section>
    </main>
  );
}
