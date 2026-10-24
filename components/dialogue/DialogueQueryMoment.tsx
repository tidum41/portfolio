"use client";

import type { ReactNode } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import ClipCard from "@/components/dialogue/product/ClipCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";

export type DialogueMomentRow = {
  label: string;
  value: number;
  display: string;
  focal?: boolean;
};

type Props = {
  frameLabel: string;
  question: string;
  summary: ReactNode;
  searchStep?: { searched: number; found: number; foundLabel?: string };
  chartTitle: string;
  chartCaption?: string;
  rows: DialogueMomentRow[];
  max: number;
  fillMode?: "index" | "magnitude";
  selectedParticipant?: string;
  selectedTime?: string;
  clip: { participant: string; segment: string; transcript: string };
  evidenceCount: number;
};

/**
 * Round G, trimmed in round H: one query, then its answer, as a single figure.
 * The evidence trail (sources, chart, clip, evidence footer) stays inside the
 * answer card in the answer's own order, with no extra markers.
 */
export default function DialogueQueryMoment({
  frameLabel,
  question,
  summary,
  searchStep,
  chartTitle,
  chartCaption,
  rows,
  max,
  fillMode = "index",
  selectedParticipant,
  selectedTime,
  clip,
  evidenceCount,
}: Props) {
  return (
    <figure className="cs-figure dialogue-live-block">
      <DialogueRachelFrame label={frameLabel} tone="system">
        <div
          className={`dialogue-moment dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
        >
          <StudyChatShell compact hideHeader hideComposer evidence={evidenceCount}>
            <UserMessageBubble>{question}</UserMessageBubble>
            {searchStep ? (
              <QuerySearchStep
                searched={searchStep.searched}
                found={searchStep.found}
                foundLabel={searchStep.foundLabel}
              />
            ) : null}
            <p className="dp-summary dp-text-body" data-annotate-part="summary">
              {summary}
            </p>
            <SourcesRow selectedParticipant={selectedParticipant} selectedTime={selectedTime} />
            <ChartVizCard title={chartTitle} caption={chartCaption}>
              <ChartBarList rows={rows} max={max} fillMode={fillMode} />
            </ChartVizCard>
            <ClipCard clip={clip} />
          </StudyChatShell>
        </div>
      </DialogueRachelFrame>
    </figure>
  );
}
