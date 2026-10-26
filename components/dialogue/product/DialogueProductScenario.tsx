import type { ReactNode } from "react";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import HeroStructuredFigure from "@/components/dialogue/product/scenarios/HeroStructuredFigure";
import AnatomyStructureFigure from "@/components/dialogue/product/scenarios/AnatomyStructureFigure";
import QuoteFrameFigure from "@/components/dialogue/product/scenarios/QuoteFrameFigure";
import FullAnswerFigure from "@/components/dialogue/product/scenarios/FullAnswerFigure";
import ThinDataFigure from "@/components/dialogue/product/scenarios/ThinDataFigure";
import InlineClipFigure from "@/components/dialogue/product/scenarios/InlineClipFigure";
import ScopeHeadersFigure from "@/components/dialogue/product/scenarios/ScopeHeadersFigure";

export type DialogueProductScenario =
  | "hero"
  | "problem-paragraphs"
  | "decision-paragraphs"
  | "decision-quotes"
  | "decision-structured"
  | "anatomy"
  | "clip-player"
  | "full-answer"
  | "thin-data"
  | "thin-data-plan"
  | "thin-data-slim"
  | "thin-data-prompt"
  | "inline-clip"
  | "scope-headers";

type Props = {
  scenario: DialogueProductScenario;
  className?: string;
};

function renderScenario(scenario: DialogueProductScenario): ReactNode {
  switch (scenario) {
    case "hero":
      return <HeroStructuredFigure />;
    case "problem-paragraphs":
      return <ParagraphAnswerFigure citedQuotes />;
    case "decision-paragraphs":
      return <ParagraphAnswerFigure />;
    case "decision-quotes":
      return <QuoteListFigure />;
    case "decision-structured":
      return <StructuredAnswerFigure compact showClips />;
    case "anatomy":
      return <AnatomyStructureFigure />;
    case "clip-player":
      return <QuoteFrameFigure />;
    case "full-answer":
      return <FullAnswerFigure />;
    case "thin-data":
      return <ThinDataFigure />;
    case "thin-data-plan":
      return <ThinDataFigure planTapped />;
    case "thin-data-slim":
      return <ThinDataFigure slim />;
    case "thin-data-prompt":
      return <ThinDataFigure planTapped showPrompt />;
    case "inline-clip":
      return <InlineClipFigure />;
    case "scope-headers":
      return <ScopeHeadersFigure />;
    default:
      return null;
  }
}

export default function DialogueProductScenario({ scenario, className }: Props) {
  return (
    <div className={["dialogue-product-figure dialogue-product-root", className].filter(Boolean).join(" ")}>
      {renderScenario(scenario)}
    </div>
  );
}
