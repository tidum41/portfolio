/**
 * Model path: Vercel AI SDK generateObject through the AI Gateway.
 * Falls back to the rule router when no key is available or the call fails.
 */

import { generateObject } from "ai";
import {
  ROUTING_MODEL,
  ROUTING_TEMPLATES,
  ROUTING_TOPICS,
  STUDY_GOAL,
  THIN_DATA_MIN_PARTICIPANTS,
} from "@/lib/dialogue/routing/constants";
import { routeByRules } from "@/lib/dialogue/routing/ruleRouter";
import {
  PARTICIPANTS,
  TOPICS,
  topicSupportCount,
} from "@/lib/dialogue/routing/sampleDataset";
import {
  routingResultSchema,
  type RoutingPath,
  type RoutingResponse,
} from "@/lib/dialogue/routing/schema";

/**
 * Prefer AI_GATEWAY_API_KEY (Vercel AI Gateway). Also accept OIDC on Vercel
 * and a plain OPENAI_API_KEY so local demos still work.
 */
export function hasGatewayKey(): boolean {
  const key =
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  return Boolean(key);
}

function inventoryLines(): string {
  return ROUTING_TOPICS.map((t) => {
    const meta = TOPICS[t];
    const n = topicSupportCount(t);
    const stamps = meta.hasTimestamps(meta.supporters(PARTICIPANTS));
    return `- ${t}: ${n} supporting; coded=${meta.hasCodedSegments}; timestamps=${stamps}`;
  }).join("\n");
}

function labelsFallback(template: string): string {
  return template.replaceAll("_", " ");
}

function systemPrompt(): string {
  return [
    "You route a UX research chat question to one answer template.",
    "This is a demo proposal, not Dialogue's real product logic.",
    `Study goal: ${STUDY_GOAL}`,
    `Templates: ${ROUTING_TEMPLATES.join(", ")}`,
    `Thin-data rule (demo choice): if supporting participants < ${THIN_DATA_MIN_PARTICIPANTS}, return thin_data, unless the question asks for clips and those people have timestamps. Then return clip_list.`,
    "Never invent counts. props.topic must be one of the listed topics.",
    "props.compareBy is only for segment_comparison (device or shopper_type).",
    "reason: one short sentence.",
    "Topic inventory:",
    inventoryLines(),
  ].join("\n");
}

export async function routeQuestion(question: string): Promise<RoutingResponse> {
  const trimmed = question.trim().slice(0, 200);
  if (!trimmed) {
    return {
      ...routeByRules("How do shoppers read Arrives by Friday?"),
      path: "rules",
    };
  }

  if (!hasGatewayKey()) {
    return { ...routeByRules(trimmed), path: "rules" };
  }

  try {
    const { object } = await generateObject({
      model: ROUTING_MODEL,
      schema: routingResultSchema,
      system: systemPrompt(),
      prompt: `Question: ${trimmed}`,
      temperature: 0,
    });
    const n = topicSupportCount(object.props.topic);
    const stamped = TOPICS[object.props.topic].hasTimestamps(
      TOPICS[object.props.topic].supporters(PARTICIPANTS),
    );
    if (
      n < THIN_DATA_MIN_PARTICIPANTS &&
      object.template !== "thin_data" &&
      !(object.template === "clip_list" && stamped)
    ) {
      return {
        template: "thin_data",
        props: { topic: object.props.topic },
        reason: `Thin data. ${n} people mention this, under the cutoff of ${THIN_DATA_MIN_PARTICIPANTS}.`,
        path: "model",
      };
    }
    const reason = (object.reason || labelsFallback(object.template))
      .replaceAll("\u2014", ", ")
      .replaceAll("\u2013", "-");
    const sentence = reason.charAt(0).toUpperCase() + reason.slice(1);
    return {
      ...object,
      reason: sentence,
      path: "model" satisfies RoutingPath,
    };
  } catch {
    return { ...routeByRules(trimmed), path: "rules" };
  }
}
