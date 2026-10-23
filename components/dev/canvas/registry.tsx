import type { ComponentType } from "react";
import DialogueChartLibrary from "@/components/dialogue/DialogueChartLibrary";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import DialogueLeadAnswerCompare from "@/components/dialogue/DialogueLeadAnswerCompare";
import DialogueProductFigure from "@/components/dialogue/DialogueProductFigure";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import ChatComposer from "@/components/dialogue/product/ChatComposer";
import ClipCard from "@/components/dialogue/product/ClipCard";
import ClipThumbnails from "@/components/dialogue/product/ClipThumbnails";
import CounterEvidence from "@/components/dialogue/product/CounterEvidence";
import DialogueLauncherButton from "@/components/dialogue/product/DialogueLauncherButton";
import EvidenceFooter from "@/components/dialogue/product/EvidenceFooter";
import FollowUpChips from "@/components/dialogue/product/FollowUpChips";
import FunnelChart from "@/components/dialogue/product/FunnelChart";
import LineChart from "@/components/dialogue/product/LineChart";
import QuerySearchStep from "@/components/dialogue/product/QuerySearchStep";
import QuoteFrequencyCard from "@/components/dialogue/product/QuoteFrequencyCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import SourcesRow from "@/components/dialogue/product/SourcesRow";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import StudyPageChrome from "@/components/dialogue/product/StudyPageChrome";
import SyncedTranscript from "@/components/dialogue/product/SyncedTranscript";
import ThemeRankingCard from "@/components/dialogue/product/ThemeRankingCard";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import { formatChartPercent } from "@/components/dialogue/product/chart/chartSpec";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import "@/components/dialogue/product/dialogue-product.css";
import {
  CHECKOUT_QUESTION,
  CLIPS,
  SEGMENT_ADDRESS,
  SENTIMENT_LINE,
} from "@/lib/dialogue/product/sampleData";

/**
 * Typed registry for the Dialogue component canvas.
 *
 * One entry per real Dialogue component used on /dialogue, imported through
 * its public export only. Entries carry safe sample props (the same sample
 * data the case study itself uses), an initial position, and the preview
 * size. Adding an entry here is the only step needed to add a preview: the
 * camera and gesture code in DialogueCanvas never changes per entry.
 */
export type CanvasRegistryEntry = {
  /** Stable id. Saved positions are keyed by this, never by name. */
  id: string;
  /** Readable name shown above the preview and copied on label click. */
  name: string;
  /** The component to mount, with its sample props baked in below. */
  Component: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Product typography and font scope that figures on /dialogue render inside. */
function ProductRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography ${dialogueProductFontClassName}`}>
      {children}
    </div>
  );
}

const HeroFigure: ComponentType = () => (
  <DialogueProductFigure scenario="hero" title="Study chat structured answer hero" />
);

const AnatomyFigure: ComponentType = () => (
  <DialogueProductFigure
    scenario="anatomy"
    title="Study chat answer card with numbered callouts for summary through follow-ups"
  />
);

const ClipPlayerFigure: ComponentType = () => (
  <DialogueProductFigure
    scenario="clip-player"
    title="Interview player at 01:38 with the speaker row highlighted in the synced transcript"
  />
);

const ThinDataFigure: ComponentType = () => (
  <DialogueProductFigure
    scenario="thin-data"
    title="Study chat answer that leads with the interview count and holds the chart back"
  />
);

const FullAnswerFigure: ComponentType = () => (
  <DialogueProductFigure
    scenario="full-answer"
    title="Follow-up answer for mobile only, with every supporting clip in one drawer"
  />
);

const LeadAnswerCompare: ComponentType = () => (
  <DialogueLeadAnswerCompare
    heading="Lead with the answer"
    subheading="Three ways the chat could answer the same question."
    chosenId="structured"
    options={[
      {
        id: "paragraphs",
        label: "Wall of text",
        title: "Paragraphs",
        costLine: "Reads complete, but you still cannot name who said what before you act.",
        productScenario: "decision-paragraphs",
      },
      {
        id: "quote-list",
        label: "Quotes only",
        title: "Quote list",
        costLine: "Faithful to the footage, but you still count by hand.",
        productScenario: "decision-quotes",
      },
      {
        id: "structured",
        label: "Answer + evidence",
        title: "Structured answer",
        costLine:
          "Clearer in one glance, but the chat has to hold summary, chart, and clips without feeling crowded.",
        productScenario: "decision-structured",
      },
    ]}
  />
);

const ChatShellSample: ComponentType = () => (
  <ProductRoot>
    <StudyChatShell evidence={18}>
      <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      <QuerySearchStep searched={24} found={9} />
      <SourcesRow />
      <FollowUpChips />
    </StudyChatShell>
  </ProductRoot>
);

const SegmentBarList: ComponentType = () => (
  <ProductRoot>
    <ChartVizCard title={SEGMENT_ADDRESS.title} caption={SEGMENT_ADDRESS.caption}>
      <ChartBarList
        rows={SEGMENT_ADDRESS.rows.map((row) => ({
          label: row.label,
          value: row.pct,
          display: formatChartPercent(row.pct),
          focal: "focal" in row && row.focal,
        }))}
        max={100}
        fillMode="index"
      />
    </ChartVizCard>
  </ProductRoot>
);

const RachelFrameSample: ComponentType = () => (
  <DialogueRachelFrame label="Solution: clip starts at 01:38 so the quote can be checked in one click" tone="solution">
    <ProductRoot>
      <SourcesRow selectedParticipant="Priya K." selectedTime="15:47" />
    </ProductRoot>
  </DialogueRachelFrame>
);

const FirstClip = CLIPS[0]!;

export const DIALOGUE_CANVAS_REGISTRY: CanvasRegistryEntry[] = [
  { id: "study-chat-hero", name: "Study chat, hero", Component: HeroFigure, x: 0, y: 0, width: 750, height: 540 },
  { id: "study-chat-anatomy", name: "Study chat, anatomy", Component: AnatomyFigure, x: 814, y: 0, width: 618, height: 1232 },
  { id: "study-chat-clip-player", name: "Study chat, clip player", Component: ClipPlayerFigure, x: 1496, y: 0, width: 656, height: 712 },
  { id: "study-chat-thin-data", name: "Study chat, thin data", Component: ThinDataFigure, x: 0, y: 604, width: 448, height: 392 },
  { id: "study-chat-full-answer", name: "Study chat, full answer", Component: FullAnswerFigure, x: 512, y: 604, width: 688, height: 688 },
  { id: "lead-answer-compare", name: "Lead answer compare", Component: LeadAnswerCompare, x: 1496, y: 776, width: 1152, height: 556 },
  { id: "chart-library", name: "Chart library", Component: DialogueChartLibrary, x: 0, y: 1420, width: 784, height: 1610 },
  {
    id: "study-page-chrome",
    name: "Study page chrome",
    Component: () => (
      <ProductRoot>
        <StudyPageChrome />
      </ProductRoot>
    ),
    x: 848, y: 1420, width: 960, height: 752,
  },
  { id: "study-chat-shell", name: "Study chat shell", Component: ChatShellSample, x: 1872, y: 1420, width: 448, height: 636 },
  {
    id: "interview-player",
    name: "Interview player",
    Component: () => (
      <ProductRoot>
        <DialogueInterviewPlayer />
      </ProductRoot>
    ),
    x: 848, y: 2236, width: 640, height: 360,
  },
  {
    id: "synced-transcript",
    name: "Synced transcript",
    Component: () => (
      <ProductRoot>
        <SyncedTranscript />
      </ProductRoot>
    ),
    x: 1552, y: 2236, width: 448, height: 292,
  },
  {
    id: "funnel-chart",
    name: "Funnel chart",
    Component: () => (
      <ProductRoot>
        <FunnelChart />
      </ProductRoot>
    ),
    x: 848, y: 2660, width: 448, height: 296,
  },
  {
    id: "line-chart",
    name: "Line chart",
    Component: () => (
      <ProductRoot>
        <LineChart
          title={SENTIMENT_LINE.title}
          points={[...SENTIMENT_LINE.points]}
          legend="Average sentiment score by prototype round"
          yMode="trend"
        />
      </ProductRoot>
    ),
    x: 1360, y: 2660, width: 448, height: 242,
  },
  {
    id: "theme-ranking-card",
    name: "Theme ranking card",
    Component: () => (
      <ProductRoot>
        <ThemeRankingCard />
      </ProductRoot>
    ),
    x: 848, y: 3020, width: 448, height: 162,
  },
  {
    id: "quote-frequency-card",
    name: "Quote frequency card",
    Component: () => (
      <ProductRoot>
        <QuoteFrequencyCard />
      </ProductRoot>
    ),
    x: 1424, y: 3020, width: 448, height: 160,
  },
  { id: "chart-bar-list", name: "Chart bar list, segment", Component: SegmentBarList, x: 848, y: 3246, width: 448, height: 162 },
  {
    id: "counter-evidence",
    name: "Counter evidence",
    Component: () => (
      <ProductRoot>
        <CounterEvidence />
      </ProductRoot>
    ),
    x: 1424, y: 3244, width: 448, height: 188,
  },
  {
    id: "clip-thumbnails",
    name: "Clip thumbnails",
    Component: () => (
      <ProductRoot>
        <ClipThumbnails selectedTime="15:47" />
      </ProductRoot>
    ),
    x: 848, y: 3472, width: 448, height: 60,
  },
  {
    id: "clip-card",
    name: "Clip card",
    Component: () => (
      <ProductRoot>
        <ClipCard clip={FirstClip} />
      </ProductRoot>
    ),
    x: 1424, y: 3496, width: 448, height: 90,
  },
  {
    id: "sources-row",
    name: "Sources row",
    Component: () => (
      <ProductRoot>
        <SourcesRow selectedParticipant="Priya K." selectedTime="15:47" />
      </ProductRoot>
    ),
    x: 848, y: 3596, width: 448, height: 86,
  },
  {
    id: "source-pill",
    name: "Source pill, disagreeing",
    Component: () => (
      <ProductRoot>
        <SourcePill name="Elena R." time="08:12" disagree />
      </ProductRoot>
    ),
    x: 1424, y: 3650, width: 240, height: 42,
  },
  {
    id: "evidence-footer",
    name: "Evidence footer",
    Component: () => (
      <ProductRoot>
        <EvidenceFooter count={18} expand />
      </ProductRoot>
    ),
    x: 848, y: 3746, width: 448, height: 44,
  },
  {
    id: "follow-up-chips",
    name: "Follow-up chips",
    Component: () => (
      <ProductRoot>
        <FollowUpChips />
      </ProductRoot>
    ),
    x: 1424, y: 3756, width: 448, height: 46,
  },
  {
    id: "chat-composer",
    name: "Chat composer",
    Component: () => (
      <ProductRoot>
        <ChatComposer />
      </ProductRoot>
    ),
    x: 848, y: 3854, width: 448, height: 160,
  },
  {
    id: "user-message-bubble",
    name: "User message bubble",
    Component: () => (
      <ProductRoot>
        <UserMessageBubble>{CHECKOUT_QUESTION}</UserMessageBubble>
      </ProductRoot>
    ),
    x: 1424, y: 3866, width: 448, height: 44,
  },
  {
    id: "query-search-step",
    name: "Query search step",
    Component: () => (
      <ProductRoot>
        <QuerySearchStep searched={24} found={9} />
      </ProductRoot>
    ),
    x: 848, y: 4078, width: 448, height: 78,
  },
  {
    id: "launcher-button",
    name: "Launcher button",
    Component: () => (
      <ProductRoot>
        <div style={{ position: "relative", height: 48 }}>
          <DialogueLauncherButton size={48} />
        </div>
      </ProductRoot>
    ),
    x: 1424, y: 3974, width: 96, height: 52,
  },
  { id: "rachel-frame", name: "Rachel frame", Component: RachelFrameSample, x: 848, y: 4220, width: 512, height: 194 },
];
