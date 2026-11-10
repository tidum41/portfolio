/**
 * Demo routing constants. Not Dialogue product rules.
 * See design/notes/routing-spec.md.
 */

/** Demo choice: under this many supporting participants, return thin_data. */
export const THIN_DATA_MIN_PARTICIPANTS = 3;

export const ROUTING_TEMPLATES = [
  "count_split",
  "segment_comparison",
  "ranked_list",
  "badge_list",
  "quote_list",
  "clip_list",
  "thin_data",
] as const;

export type RoutingTemplate = (typeof ROUTING_TEMPLATES)[number];

export const ROUTING_TOPICS = [
  "friday_reading",
  "address_friction",
  "packaging_damage",
  "returns",
] as const;

export type RoutingTopic = (typeof ROUTING_TOPICS)[number];

export const COMPARE_BY = ["device", "shopper_type", "none"] as const;
export type CompareBy = (typeof COMPARE_BY)[number];

/** Study goal fixed for the example dataset. */
export const STUDY_GOAL =
  "Understand how shoppers read delivery promises at checkout.";

/** Cheap fast model via Vercel AI Gateway. */
export const ROUTING_MODEL = "openai/gpt-4o-mini";
