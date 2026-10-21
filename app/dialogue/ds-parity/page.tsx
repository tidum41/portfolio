import type { Metadata } from "next";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ClipCard from "@/components/dialogue/product/ClipCard";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import { CHECKOUT_QUESTION, CLIPS } from "@/lib/dialogue/product/sampleData";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dialogue DS parity (internal)",
};

const LIVE_W = 560;

export default function DialogueDsParityPage() {
  return (
    <div
      className="dialogue-ds-parity"
      style={{
        background: "#1a1816",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <section data-parity-id="chat-shell">
        <div
          data-parity-live
          style={{ width: LIVE_W, background: "var(--dp-bg)", padding: 16, borderRadius: 8 }}
        >
          <div className="dialogue-product-root">
            <StudyChatShell compact>
              <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
              <QuerySearchStep searched={24} found={9} />
            </StudyChatShell>
          </div>
        </div>
      </section>

      <section data-parity-id="answer-card">
        <div
          data-parity-live
          style={{ width: LIVE_W, background: "var(--dp-bg)", padding: 16, borderRadius: 8 }}
        >
          <div className="dialogue-product-root">
            <StudyChatShell compact>
              <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
              <QuerySearchStep searched={24} found={9} />
              <FunnelChart hero showFootnote />
            </StudyChatShell>
          </div>
        </div>
      </section>

      <section data-parity-id="funnel">
        <div
          data-parity-live
          style={{ width: LIVE_W, background: "var(--dp-card)", padding: 16, borderRadius: 8 }}
        >
          <div className="dialogue-product-root">
            <FunnelChart hero showFootnote />
          </div>
        </div>
      </section>

      <section data-parity-id="clip-card">
        <div
          data-parity-live
          style={{ width: LIVE_W, background: "var(--dp-bg)", padding: 16, borderRadius: 8 }}
        >
          <div className="dialogue-product-root">
            <ClipCard clip={CLIPS[0]} />
          </div>
        </div>
      </section>

      <section data-parity-id="study-chrome">
        <div
          data-parity-live
          style={{ width: LIVE_W, background: "var(--dp-bg)", padding: 16, borderRadius: 8 }}
        >
          <div className="dialogue-product-root">
            <StudyPageChrome />
          </div>
        </div>
      </section>
    </div>
  );
}
