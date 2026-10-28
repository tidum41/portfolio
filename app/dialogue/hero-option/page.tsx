import DialogueChatLive from "@/components/dialogue/live/DialogueChatLive";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Hero option: enlarged answer card", robots: { index: false } };

/** Option only (conflicts with the 640 column lock in TASTE.md): the answered card at 923px, Rachel Chen's hero width, next to the 640 column. */
export default function Page() {
  return (
    <main className="dialogue-product-root dp-chat-panel-typography" style={{ padding: 40, display: "grid", gap: 48, justifyItems: "center" }}>
      <section id="opt-640" style={{ width: 640 }}>
        <p>A. Current: 640 column</p>
        <div className="dialogue-rachel-frame dialogue-rachel-frame--solution" style={{ padding: 20 }}>
          <div style={{ width: 471, margin: "0 auto" }}><DialogueChatLive height={420} startAnswered /></div>
        </div>
      </section>
      <section id="opt-923" style={{ width: 923 }}>
        <p>B. Option: enlarged answer card at 923</p>
        <div className="dialogue-rachel-frame dialogue-rachel-frame--solution" style={{ padding: 20 }}>
          <div style={{ width: 471, margin: "0 auto", zoom: 1.45 }}><DialogueChatLive height={420} startAnswered /></div>
        </div>
      </section>
    </main>
  );
}
