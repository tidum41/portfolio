"use client";

import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import CounterEvidence from "@/components/dialogue/product/CounterEvidence";
import ClipCard from "@/components/dialogue/product/ClipCard";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { formatChartCount } from "@/components/dialogue/product/chart/chartSpec";
import {
  CHECKOUT_FUNNEL,
  CHECKOUT_QUESTION,
  CLIPS,
  COVERAGE_ADDRESS,
} from "@/lib/dialogue/product/sampleData";

/**
 * Round H hero: one full-width query, then the whole answer. The summary,
 * sources and funnel carry the supporting evidence; the coverage split, the
 * three participants who had no trouble, and the thin mobile slice sit
 * alongside it in the same card. Every number is the study's own sample data.
 */
export default function DialogueHeroMoment() {
  return (
    <div
      className={`dialogue-hero-moment dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <StudyChatShell evidence={24}>
        <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
        <QuerySearchStep searched={24} found={18} />
        <p className="dp-summary dp-text-body" data-annotate-part="summary">
          {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[0]}
          <span className="dp-summary__emph" data-annotate-part="summary-emphasis">
            {CHECKOUT_FUNNEL.emphasis}
          </span>
          {CHECKOUT_FUNNEL.summary.split(CHECKOUT_FUNNEL.emphasis)[1] ?? ""}
        </p>
        <SourcesRow selectedParticipant="Priya K." />
        <div className="dialogue-hero-moment__grid">
          <FunnelChart showSummary={false} vizCard />
          <div className="dialogue-hero-moment__side">
            <ChartVizCard
              title={COVERAGE_ADDRESS.title}
              caption="Counts of the 24 interviews behind the funnel"
            >
              <ChartBarList
                rows={COVERAGE_ADDRESS.rows.map((r) => ({
                  label: r.label === "Mentioned it" ? "Said it" : "Did not",
                  value: r.count,
                  display: formatChartCount(r.count),
                }))}
                max={24}
                fillMode="magnitude"
              />
            </ChartVizCard>
            <CounterEvidence />
          </div>
        </div>
        <div className="dialogue-hero-moment__clips">
          <ClipCard clip={CLIPS[0]} />
          <div className="dialogue-hero-moment__thin">
            <p className="dialogue-hero-moment__thin-count">4 of 24</p>
            <p className="dialogue-hero-moment__thin-text">
              Where it stays thin: only four interviews mention the mobile autofill complaint,
              so that answer leads with its count and holds the chart back.
            </p>
          </div>
        </div>
        <FollowUpChips />
      </StudyChatShell>
    </div>
  );
}
