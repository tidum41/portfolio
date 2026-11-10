import {
  PLAYGROUND_PRESETS,
  resolvePlayground,
  type BadgeResolved,
  type RankedResolved,
} from "@/lib/dialogue/routing/playground";
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
  | { template: "ranked_list"; data: RankedResolved }
  | { template: "badge_list"; data: BadgeResolved }
  | { template: "quote_list"; data: QuoteResolved }
  | { template: "clip_list"; data: ClipResolved }
  | { template: "thin_data"; data: ThinResolved };

export function resolveRouting(result: RoutingResult, question = ""): ResolvedAnswer {
  const playground = resolvePlayground(question);
  if (playground) return playground;

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
    case "ranked_list": {
      const data =
        (resolvePlayground(question) ?? resolvePlayground(PLAYGROUND_PRESETS[2])!)?.data as RankedResolved;
      return { template: "ranked_list", data };
    }
    case "badge_list": {
      const data =
        (resolvePlayground(question) ?? resolvePlayground(PLAYGROUND_PRESETS[3])!)?.data as BadgeResolved;
      return { template: "badge_list", data };
    }
  }
}
