import { z } from "zod";
import {
  COMPARE_BY,
  ROUTING_TEMPLATES,
  ROUTING_TOPICS,
} from "@/lib/dialogue/routing/constants";

export const routingResultSchema = z.object({
  template: z.enum(ROUTING_TEMPLATES),
  props: z.object({
    topic: z.enum(ROUTING_TOPICS),
    compareBy: z.enum(COMPARE_BY).optional(),
    side: z.enum(["left", "right"]).optional(),
  }),
  reason: z.string().min(1).max(240),
});

export type RoutingResult = z.infer<typeof routingResultSchema>;

export type RoutingPath = "model" | "rules";

export type RoutingResponse = RoutingResult & {
  path: RoutingPath;
};
