"use client";

import LeadCompareAnswerCard, {
  type LeadCompareVariant,
} from "@/components/dialogue/product/scenarios/LeadCompareAnswerCard";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import type { DialogueProductScenario as Scenario } from "@/components/dialogue/product/DialogueProductScenario";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { LEAD_COMPARE_QUESTION } from "@/lib/dialogue/product/sampleData";
import StaticFigure from "@/components/dialogue/StaticFigure";
import DialogueRachelFrame, { DialogueCaption } from "@/components/dialogue/DialogueRachelFrame";
import type { RasterAnnotator } from "@/components/dialogue/DialogueCaseStudyContent";

type Option = {
  id: string;
  title: string;
  label: string;
  costLine?: string;
  priorityLine?: string;
  howeverLine?: string;
  selectionNote?: string;
  reasonLines?: string[];
  productScenario: Scenario;
  rasterAssetId?: string;
};

type Props = {
  heading?: string;
  subheading?: string;
  options: Option[];
  chosenId: string;
  annotateRaster?: RasterAnnotator;
};

function scenarioToVariant(scenario: Scenario): LeadCompareVariant {
  if (scenario === "decision-quotes") return "quotes";
  if (scenario === "decision-structured") return "structured";
  return "paragraphs";
}

function OptionPanel({
  option,
  isChosen,
  annotateRaster,
}: {
  option: Option;
  isChosen: boolean;
  annotateRaster?: RasterAnnotator;
}) {
  const figure = (
    <div
      className={`dialogue-lead-answer__answer dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}
    >
      <UserMessageBubble>{LEAD_COMPARE_QUESTION}</UserMessageBubble>
      <LeadCompareAnswerCard variant={scenarioToVariant(option.productScenario)} />
    </div>
  );
  const wrapped =
    option.rasterAssetId && annotateRaster
      ? annotateRaster(option.rasterAssetId, figure)
      : figure;

  const cost = option.costLine ?? option.priorityLine;

  return (
    <div
      className={[
        "dialogue-lead-answer__panel",
        isChosen ? "dialogue-lead-answer__panel--chosen dialogue-lead-answer__panel--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isChosen ? (
        <p className="dialogue-lead-answer__chosen-row">
          <span className="dialogue-lead-answer__chosen-badge">Chosen</span>
        </p>
      ) : (
        <p className="dialogue-lead-answer__chosen-row dialogue-lead-answer__chosen-row--spacer" aria-hidden />
      )}
      <div className="dialogue-lead-answer__option-card">
        <StaticFigure
          figure={`lead-answer-${option.id}`}
          className="dialogue-product-block dialogue-product-block--static"
        >
          {wrapped}
        </StaticFigure>
      </div>
      <DialogueCaption label={option.label} sentence={cost} />
    </div>
  );
}

export default function DialogueLeadAnswerCompare({
  heading,
  subheading,
  options,
  chosenId,
  annotateRaster,
}: Props) {
  return (
    <div className="dialogue-lead-answer">
      {heading || subheading ? (
        <p className="dialogue-caption dialogue-caption--block">
          <span className="dialogue-caption__label">{heading}</span>
          <span className="dialogue-caption__sentence">{subheading}</span>
        </p>
      ) : null}
      <DialogueRachelFrame tone="system" className="dialogue-lead-answer__well">
        <div className="dialogue-lead-answer__row dialogue-lead-answer__row--trio">
          {options.map((option) => (
            <OptionPanel
              key={option.id}
              option={option}
              isChosen={option.id === chosenId}
              annotateRaster={annotateRaster}
            />
          ))}
        </div>
      </DialogueRachelFrame>
    </div>
  );
}
