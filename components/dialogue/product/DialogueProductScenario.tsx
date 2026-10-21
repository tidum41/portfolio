import type { ReactNode } from "react";
import ParagraphAnswerFigure from "@/components/dialogue/product/scenarios/ParagraphAnswerFigure";
import StructuredAnswerFigure from "@/components/dialogue/product/scenarios/StructuredAnswerFigure";
import QuoteListFigure from "@/components/dialogue/product/scenarios/QuoteListFigure";
import HeroStructuredFigure from "@/components/dialogue/product/scenarios/HeroStructuredFigure";
import AnatomyStructureFigure from "@/components/dialogue/product/scenarios/AnatomyStructureFigure";
import ClipPlayerFigure from "@/components/dialogue/product/scenarios/ClipPlayerFigure";
import PlacementDockedFigure from "@/components/dialogue/product/scenarios/PlacementDockedFigure";
import PlacementBubbleFigure from "@/components/dialogue/product/scenarios/PlacementBubbleFigure";
import FullAnswerFigure from "@/components/dialogue/product/scenarios/FullAnswerFigure";
import ChartGalleryFigure, {
  type GalleryVariant,
} from "@/components/dialogue/product/scenarios/ChartGalleryFigure";

export type DialogueProductScenario =
  | "hero"
  | "problem-paragraphs"
  | "decision-paragraphs"
  | "decision-quotes"
  | "decision-structured"
  | "anatomy"
  | "clip-player"
  | "placement-docked"
  | "placement-bubble"
  | "full-answer"
  | { gallery: GalleryVariant };

type Props = {
  scenario: DialogueProductScenario;
  className?: string;
};

function renderScenario(scenario: DialogueProductScenario): ReactNode {
  if (typeof scenario === "object" && "gallery" in scenario) {
    return <ChartGalleryFigure variant={scenario.gallery} />;
  }
  switch (scenario) {
    case "hero":
      return <HeroStructuredFigure />;
    case "problem-paragraphs":
    case "decision-paragraphs":
      return <ParagraphAnswerFigure />;
    case "decision-quotes":
      return <QuoteListFigure />;
    case "decision-structured":
      return <StructuredAnswerFigure compact showClips />;
    case "anatomy":
      return <AnatomyStructureFigure />;
    case "clip-player":
      return <ClipPlayerFigure />;
    case "placement-docked":
      return <PlacementDockedFigure />;
    case "placement-bubble":
      return <PlacementBubbleFigure />;
    case "full-answer":
      return <FullAnswerFigure />;
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
