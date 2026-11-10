import DialogueChatLive from "@/components/dialogue/live/DialogueChatLive";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata = { title: "Dialogue study chat, live recreation", robots: { index: false } };

/** Recording stage for the P10 demos: one chat panel on the product background. */
export default async function Page({ searchParams }: { searchParams: Promise<{ v?: string; h?: string; c?: string; q?: string }> }) {
  const { v, h, c, q } = await searchParams;
  const variant = v === "picker" || v === "toggles" || v === "before" || v === "every" ? v : "base";
  return (
    <main className="dialogue-product-root dp-chat-panel-typography dlg-live-stage">
      <div id="stage" className="dlg-live-stage__slot">
        <DialogueChatLive height={Number(h) || 600} variant={variant} chrome={c !== "0"} quick={q === "1"} key={variant} />
      </div>
    </main>
  );
}
