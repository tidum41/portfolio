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

/** Native export layout widths (transforms stripped in parity capture). */
const PARITY_W = {
  "chat-shell": 400,
  "answer-card": 400,
  funnel: 343,
  "clip-row": 343,
  "follow-ups": 343,
  "study-chrome": 400,
} as const;

function LiveFrame({ id, children }: { id: keyof typeof PARITY_W; children: ReactNode }) {
  const width = PARITY_W[id];
  return (
    <div
      data-parity-live
      style={{
        width,
        maxWidth: width,
        background: "var(--dp-bg)",
        padding: 0,
        borderRadius: 8,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div className="dialogue-product-root dp-chat-panel-typography">{children}</div>
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
        <LiveFrame id="chat-shell">
          <StudyChatShell>
            <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
            <QuerySearchStep searched={24} found={9} />
          </StudyChatShell>
        </LiveFrame>
      </section>

      <section data-parity-id="answer-card">
        <LiveFrame id="answer-card">
          <StructuredAnswerFigure />
        </LiveFrame>
      </section>

      <section data-parity-id="funnel">
        <LiveFrame id="funnel">
          <FunnelChart vizCard />
        </LiveFrame>
      </section>

      <section data-parity-id="clip-row">
        <LiveFrame id="clip-row">
          <ClipThumbnails />
        </LiveFrame>
      </section>

      <section data-parity-id="follow-ups">
        <LiveFrame id="follow-ups">
          <FollowUpChips />
        </LiveFrame>
      </section>

      <section data-parity-id="study-chrome">
        <LiveFrame id="study-chrome">
          <StudyPageChrome paperScale />
        </LiveFrame>
      </section>
    </div>
  );
}
