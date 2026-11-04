/**
 * Deterministic keyword + data router that implements design/notes/routing-spec.md.
 * Used when no AI Gateway key is available, and as the eval baseline.
 */

import {
  THIN_DATA_MIN_PARTICIPANTS,
  type CompareBy,
  type RoutingTemplate,
  type RoutingTopic,
} from "@/lib/dialogue/routing/constants";
import {
  PARTICIPANTS,
  TOPICS,
  isThinTopic,
  topicSupportCount,
} from "@/lib/dialogue/routing/sampleDataset";
import type { RoutingResult } from "@/lib/dialogue/routing/schema";

export type QueryType =
  | "count_split"
  | "segment_comparison"
  | "quote_evidence"
  | "clip"
  | "open_ended";

const TOPIC_KEYWORDS: { topic: RoutingTopic; words: string[] }[] = [
  {
    topic: "packaging_damage",
    words: ["damag", "packag", "crush", "broken", "seal", "box arriv"],
  },
  {
    topic: "address_friction",
    words: ["address", "apartment", "autocomplete", "shipping field", "country switch"],
  },
  {
    topic: "returns",
    words: ["return", "refund", "send back"],
  },
  {
    topic: "friday_reading",
    words: ["friday", "arrives by", "delivery date", "delivery promise", "this week"],
  },
];

export function inferTopic(question: string): RoutingTopic {
  const q = question.toLowerCase();
  for (const row of TOPIC_KEYWORDS) {
    if (row.words.some((w) => q.includes(w))) return row.topic;
  }
  return "friday_reading";
}

export function inferQueryType(question: string): QueryType {
  const q = question.toLowerCase();
  if (/\b(play|hear|listen|clip|footage|recording|watch)\b/.test(q)) return "clip";
  if (/\b(quotes?|said|say|verbatim|evidence|exact words|transcript)\b/.test(q)) {
    return "quote_evidence";
  }
  if (
    /\b(vs|versus|compared?|between|by (device|segment|group|type)|mobile|desktop|first[- ]?time|repeat)\b/.test(
      q,
    )
  ) {
    return "segment_comparison";
  }
  if (
    /\b(how many|how do|what share|what (percent|percentage)|count|split)\b/.test(q) ||
    /\bhow (do|did|does)\b.*\bread\b/.test(q) ||
    /\bread\b.*\b(friday|arrives)\b/.test(q)
  ) {
    return "count_split";
  }
  if (/\b(why|tell me|explore|what else|open)\b/.test(q)) return "open_ended";
  return "count_split";
}

export function inferCompareBy(question: string): CompareBy {
  const q = question.toLowerCase();
  if (/\b(mobile|desktop|device|phone)\b/.test(q)) return "device";
  if (/\b(first[- ]?time|repeat|shopper type|new shopper|returning)\b/.test(q)) {
    return "shopper_type";
  }
  return "shopper_type";
}

function canFill(template: RoutingTemplate, topic: RoutingTopic): boolean {
  const meta = TOPICS[topic];
  const n = topicSupportCount(topic);
  if (template === "thin_data") return n < THIN_DATA_MIN_PARTICIPANTS;
  if (n < THIN_DATA_MIN_PARTICIPANTS) return false;
  if (template === "count_split" || template === "segment_comparison") {
    return meta.hasCodedSegments;
  }
  if (template === "quote_list" || template === "clip_list") {
    return meta.hasTimestamps(meta.supporters(PARTICIPANTS));
  }
  return false;
}

const FALLBACK_ORDER: RoutingTemplate[] = [
  "clip_list",
  "quote_list",
  "count_split",
  "thin_data",
];

function preferredTemplate(queryType: QueryType): RoutingTemplate {
  switch (queryType) {
    case "clip":
      return "clip_list";
    case "quote_evidence":
      return "quote_list";
    case "segment_comparison":
      return "segment_comparison";
    case "open_ended":
      return "quote_list";
    case "count_split":
    default:
      return "count_split";
  }
}

function pickWithFallback(
  preferred: RoutingTemplate,
  topic: RoutingTopic,
): RoutingTemplate {
  if (isThinTopic(topic)) return "thin_data";
  if (canFill(preferred, topic)) return preferred;
  for (const next of FALLBACK_ORDER) {
    if (next === preferred) continue;
    if (canFill(next, topic)) return next;
  }
  return "thin_data";
}

export function routeByRules(question: string): RoutingResult {
  const topic = inferTopic(question);
  const queryType = inferQueryType(question);
  const compareBy = inferCompareBy(question);
  const preferred = preferredTemplate(queryType);
  const template = pickWithFallback(preferred, topic);
  const n = topicSupportCount(topic);

  const labels: Record<RoutingTemplate, string> = {
    count_split: "count split",
    segment_comparison: "segment comparison",
    quote_list: "quote list",
    clip_list: "clip list",
    thin_data: "thin data",
  };

  let reason: string;
  if (template === "thin_data") {
    reason = `Picked thin data because ${n} supporting participant${n === 1 ? "" : "s"} is under the demo cutoff of ${THIN_DATA_MIN_PARTICIPANTS}.`;
  } else if (template !== preferred) {
    reason = `Picked ${labels[template]} because the ask was ${queryType.replaceAll("_", " ")}, and the available coded data on ${topic.replaceAll("_", " ")} fits this template better.`;
  } else {
    reason = `Picked ${labels[template]} because the question reads as ${queryType.replaceAll("_", " ")}, with ${n} coded people on ${topic.replaceAll("_", " ")}.`;
  }

  return {
    template,
    props: {
      topic,
      ...(template === "segment_comparison" ? { compareBy } : {}),
    },
    reason,
  };
}
