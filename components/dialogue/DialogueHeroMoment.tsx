"use client";

import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ClipCard from "@/components/dialogue/product/ClipCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import {
  CHECKOUT_FUNNEL,
  CLIPS,
  COVERAGE_ADDRESS,
} from "@/lib/dialogue/product/sampleData";
import { HERO_QUESTION } from "@/components/dialogue/product/scenarios/HeroChatCard";

/**
 * Direction A hero: one question, one answer sentence, one count bar, one
 * quote card. Nothing else. Every string and count is the checkout study's
 * own (24 interviews, 18 of 24 on address friction, Jordan M.'s clip).
 */
export default function DialogueHeroMoment() {
  return (
    <div
      className={`dialogue-hero-moment dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <StudyChatShell evidence={24}>
        <UserMessageBubble>{HERO_QUESTION}</UserMessageBubble>
        <p className="dp-summary dp-text-body" data-annotate-part="summary">
          {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
          <span className="dp-summary__emph" data-annotate-part="summary-emphasis">
            {CHECKOUT_FUNNEL.emphasis}
          </span>
          {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
        </p>
        <ChartVizCard title={COVERAGE_ADDRESS.headline}>
          <ChartBarList
            className="dp-chart-bars--count"
            rows={[
              {
                label: "Address friction",
                value: 18,
                display: "18 of 24 interviews",
                focal: true,
              },
            ]}
            max={24}
            fillMode="magnitude"
          />
        </ChartVizCard>
        <ClipCard clip={CLIPS[0]} />
      </StudyChatShell>
    </div>
  );
}
