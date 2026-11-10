"use client";

import CountSplitTemplate from "@/components/dialogue/routing/templates/CountSplitTemplate";
import PlaygroundCountSplitTemplate from "@/components/dialogue/routing/templates/PlaygroundCountSplitTemplate";
import SegmentComparisonTemplate from "@/components/dialogue/routing/templates/SegmentComparisonTemplate";
import RankedListTemplate from "@/components/dialogue/routing/templates/RankedListTemplate";
import BadgeListTemplate from "@/components/dialogue/routing/templates/BadgeListTemplate";
import QuoteListTemplate from "@/components/dialogue/routing/templates/QuoteListTemplate";
import ClipListTemplate from "@/components/dialogue/routing/templates/ClipListTemplate";
import ThinDataTemplate from "@/components/dialogue/routing/templates/ThinDataTemplate";
import type { RoutingTemplate } from "@/lib/dialogue/routing/constants";
import type {
  BadgeResolved,
  RankedResolved,
} from "@/lib/dialogue/routing/playground";
import type {
  ClipResolved,
  CountSplitResolved,
  QuoteResolved,
  SegmentResolved,
  ThinResolved,
} from "@/lib/dialogue/routing/sampleDataset";

export type RoutingAnswerData =
  | CountSplitResolved
  | (CountSplitResolved & { whyChart: string })
  | SegmentResolved
  | (SegmentResolved & { whyChart: string })
  | RankedResolved
  | BadgeResolved
  | QuoteResolved
  | ClipResolved
  | ThinResolved;

type Props = {
  template: RoutingTemplate;
  data: RoutingAnswerData;
  onAsk?: (question: string) => void;
  /** Screenshot helpers */
  initialSide?: string | null;
  initialPlaying?: string | null;
  initialClip?: boolean;
};

export default function RoutingAnswer({
  template,
  data,
  onAsk,
  initialSide = null,
  initialPlaying = null,
  initialClip = false,
}: Props) {
  switch (template) {
    case "count_split": {
      const row = data as CountSplitResolved & { whyChart?: string };
      if (row.whyChart) return <PlaygroundCountSplitTemplate data={{ ...row, whyChart: row.whyChart }} />;
      return (
        <CountSplitTemplate
          data={row}
          initialSide={initialSide}
          initialClip={initialClip}
        />
      );
    }
    case "segment_comparison":
      return <SegmentComparisonTemplate data={data as SegmentResolved & { whyChart?: string }} />;
    case "ranked_list":
      return <RankedListTemplate data={data as RankedResolved} />;
    case "badge_list":
      return <BadgeListTemplate data={data as BadgeResolved} />;
    case "quote_list":
      return <QuoteListTemplate data={data as QuoteResolved} />;
    case "clip_list":
      return (
        <ClipListTemplate data={data as ClipResolved} initialPlaying={initialPlaying} />
      );
    case "thin_data":
      return <ThinDataTemplate data={data as ThinResolved} onAsk={onAsk} />;
  }
}
