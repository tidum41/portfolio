"use client";

import CountSplitTemplate from "@/components/dialogue/routing/templates/CountSplitTemplate";
import SegmentComparisonTemplate from "@/components/dialogue/routing/templates/SegmentComparisonTemplate";
import QuoteListTemplate from "@/components/dialogue/routing/templates/QuoteListTemplate";
import ClipListTemplate from "@/components/dialogue/routing/templates/ClipListTemplate";
import ThinDataTemplate from "@/components/dialogue/routing/templates/ThinDataTemplate";
import type { RoutingTemplate } from "@/lib/dialogue/routing/constants";
import type {
  ClipResolved,
  CountSplitResolved,
  QuoteResolved,
  SegmentResolved,
  ThinResolved,
} from "@/lib/dialogue/routing/sampleDataset";

export type RoutingAnswerData =
  | CountSplitResolved
  | SegmentResolved
  | QuoteResolved
  | ClipResolved
  | ThinResolved;

type Props = {
  template: RoutingTemplate;
  data: RoutingAnswerData;
  /** Screenshot helpers */
  initialSide?: string | null;
  initialPlaying?: string | null;
};

export default function RoutingAnswer({
  template,
  data,
  initialSide = null,
  initialPlaying = null,
}: Props) {
  switch (template) {
    case "count_split":
      return <CountSplitTemplate data={data as CountSplitResolved} initialSide={initialSide} />;
    case "segment_comparison":
      return <SegmentComparisonTemplate data={data as SegmentResolved} />;
    case "quote_list":
      return <QuoteListTemplate data={data as QuoteResolved} />;
    case "clip_list":
      return (
        <ClipListTemplate data={data as ClipResolved} initialPlaying={initialPlaying} />
      );
    case "thin_data":
      return <ThinDataTemplate data={data as ThinResolved} />;
  }
}
