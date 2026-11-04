import type { RoutingResult } from "@/lib/dialogue/routing/schema";
import {
  resolveClips,
  resolveCountSplit,
  resolveQuotes,
  resolveSegmentComparison,
  resolveThin,
  type ClipResolved,
  type CountSplitResolved,
  type QuoteResolved,
  type SegmentResolved,
  type ThinResolved,
} from "@/lib/dialogue/routing/sampleDataset";

export type ResolvedAnswer =
  | { template: "count_split"; data: CountSplitResolved }
  | { template: "segment_comparison"; data: SegmentResolved }
  | { template: "quote_list"; data: QuoteResolved }
  | { template: "clip_list"; data: ClipResolved }
  | { template: "thin_data"; data: ThinResolved };

export function resolveRouting(result: RoutingResult): ResolvedAnswer {
  const topic = result.props.topic;
  switch (result.template) {
    case "count_split":
      return { template: "count_split", data: resolveCountSplit(topic) };
    case "segment_comparison":
      return {
        template: "segment_comparison",
        data: resolveSegmentComparison(topic, result.props.compareBy ?? "shopper_type"),
      };
    case "quote_list":
      return { template: "quote_list", data: resolveQuotes(topic) };
    case "clip_list":
      return { template: "clip_list", data: resolveClips(topic) };
    case "thin_data":
      return { template: "thin_data", data: resolveThin(topic) };
  }
}
