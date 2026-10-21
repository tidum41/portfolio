import type { Metadata } from "next";
import type { ReactNode } from "react";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import { CHECKOUT_QUESTION } from "@/lib/dialogue/product/sampleData";
import "@/components/dialogue/product/dialogue-product.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Dialogue DS parity (internal)",
};

/** Paper chat panel width (`section-3.html` export). */
const LIVE_W = 400;

function LiveFrame({ children }: { children: ReactNode }) {
  return (
    <div
      data-parity-live
      style={{
        width: LIVE_W,
        background: "var(--dp-bg)",
        padding: 0,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div className="dialogue-product-root">{children}</div>
    </div>
  );
}

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
        <LiveFrame>
          <StudyChatShell>
            <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
            <QuerySearchStep searched={24} found={9} />
          </StudyChatShell>
        </LiveFrame>
      </section>

      <section data-parity-id="answer-card">
        <LiveFrame>
          <StructuredAnswerFigure />
        </LiveFrame>
      </section>

      <section data-parity-id="funnel">
        <LiveFrame>
          <FunnelChart vizCard />
        </LiveFrame>
      </section>

      <section data-parity-id="clip-row">
        <LiveFrame>
          <ClipThumbnails />
        </LiveFrame>
      </section>

      <section data-parity-id="follow-ups">
        <LiveFrame>
          <FollowUpChips />
        </LiveFrame>
      </section>

      <section data-parity-id="study-chrome">
        <LiveFrame>
          <StudyPageChrome paperScale />
        </LiveFrame>
      </section>
    </div>
  );
}
