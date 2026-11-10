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
import { matchPlaygroundTemplate } from "@/lib/dialogue/routing/playground";
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
  if (/\b(play|hear|listen|watch|footage|recording|clips?)\b/.test(q)) return "clip";
  if (/\b(quotes?|said|say|verbatim|evidence|exact words|transcript)\b/.test(q)) {
    return "quote_evidence";
  }
  if (/\bsame way\b/.test(q) || /\bnew and repeat\b/.test(q)) return "segment_comparison";
  if (
    /\b(vs|versus|compared?|between|by (device|segment|group|type)|mobile|desktop|first[- ]?time|repeat)\b/.test(
      q,
    )
  ) {
    return "segment_comparison";
  }
  if (/\bmiss(ed)?\b/.test(q) && /\bdelivery\b/.test(q)) return "open_ended";
  if (/\bask\b/.test(q) && /\bcheckout\b/.test(q)) return "open_ended";
  if (/\bbadge\b/.test(q) && /\bconfidence\b/.test(q)) return "open_ended";
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
  queryType: QueryType,
): RoutingTemplate {
  // A clip ask stays a clip list when those people have timestamps, even under the thin cutoff.
  if (
    queryType === "clip" &&
    TOPICS[topic].hasTimestamps(TOPICS[topic].supporters(PARTICIPANTS))
  ) {
    return "clip_list";
  }
  if (isThinTopic(topic)) return "thin_data";
  if (canFill(preferred, topic)) return preferred;
  for (const next of FALLBACK_ORDER) {
    if (next === preferred) continue;
    if (canFill(next, topic)) return next;
  }
  return "thin_data";
}

export function routeByRules(question: string): RoutingResult {
  const playgroundTemplate = matchPlaygroundTemplate(question);
  const topic = inferTopic(question);
  const queryType = inferQueryType(question);
  const compareBy = inferCompareBy(question);
  const preferred = playgroundTemplate ?? preferredTemplate(queryType);
  const template = playgroundTemplate ?? pickWithFallback(preferred, topic, queryType);
  const n = topicSupportCount(topic);
  const topicLabel = TOPICS[topic].label;

  const labels: Record<RoutingTemplate, string> = {
    count_split: "Count split",
    segment_comparison: "Segment comparison",
    ranked_list: "Ranked",
    badge_list: "Badge comparison",
    quote_list: "Quote list",
    clip_list: "Clip list",
    thin_data: "Thin data",
  };

  let reason: string;
  if (template === "thin_data") {
    reason = `Thin data. ${n} ${n === 1 ? "person mentions" : "people mention"} ${topicLabel}, under the cutoff of ${THIN_DATA_MIN_PARTICIPANTS}.`;
  } else if (template !== preferred) {
    reason = `${labels[template]}. The coded answers on ${topicLabel} fit this template.`;
  } else {
    reason = `${labels[template]}. ${n} ${n === 1 ? "person is" : "people are"} coded on ${topicLabel}.`;
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
