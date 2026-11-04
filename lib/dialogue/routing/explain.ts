/**
 * Spec-row fields for the "How it routed" toggle.
 * Demo proposal only; not Dialogue product logic.
 */

import { STUDY_GOAL, THIN_DATA_MIN_PARTICIPANTS } from "@/lib/dialogue/routing/constants";
import {
  PARTICIPANTS,
  TOPICS,
  topicSupportCount,
} from "@/lib/dialogue/routing/sampleDataset";
import { inferQueryType, type QueryType } from "@/lib/dialogue/routing/ruleRouter";
import type { RoutingResult } from "@/lib/dialogue/routing/schema";

const TEMPLATE_LABEL: Record<RoutingResult["template"], string> = {
  count_split: "count split",
  segment_comparison: "segment comparison",
  quote_list: "quote list",
  clip_list: "clip list",
  thin_data: "thin data",
};

const QUERY_LABEL: Record<QueryType, string> = {
  count_split: "count or split",
  segment_comparison: "segment comparison",
  quote_evidence: "quote or evidence",
  clip: "clip",
  open_ended: "open-ended",
};

export type RoutingExplain = {
  queryType: QueryType;
  queryTypeLabel: string;
  dataAvailable: string;
  goal: string;
  templateLabel: string;
  supportCount: number;
  pickedLine: string;
};

export function explainRouting(question: string, result: RoutingResult): RoutingExplain {
  const topic = result.props.topic;
  const queryType = inferQueryType(question);
  const meta = TOPICS[topic];
  const n = topicSupportCount(topic);
  const stamps = meta.hasTimestamps(meta.supporters(PARTICIPANTS));
  const parts = [
    `${n} supporting participant${n === 1 ? "" : "s"}`,
    meta.hasCodedSegments ? "coded segments" : "no coded segments",
    stamps ? "transcript timestamps" : "no timestamps",
  ];
  if (n < THIN_DATA_MIN_PARTICIPANTS) {
    parts.push(`under the demo cutoff of ${THIN_DATA_MIN_PARTICIPANTS}`);
  }

  const templateLabel = TEMPLATE_LABEL[result.template];
  const queryTypeLabel = QUERY_LABEL[queryType];
  let pickedLine: string;
  if (result.template === "thin_data") {
    pickedLine = `Picked thin data because ${n} supporting participant${n === 1 ? "" : "s"} is under the demo cutoff of ${THIN_DATA_MIN_PARTICIPANTS}.`;
  } else {
    pickedLine = `Picked ${templateLabel} because the question reads as ${queryTypeLabel}, and the example study has ${parts[0]} with ${parts[1]}.`;
  }

  return {
    queryType,
    queryTypeLabel,
    dataAvailable: parts.join(", "),
    goal: STUDY_GOAL,
    templateLabel,
    supportCount: n,
    pickedLine,
  };
}
