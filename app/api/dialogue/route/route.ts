import { NextResponse } from "next/server";
import { explainRouting, formatRoutingLine } from "@/lib/dialogue/routing/explain";
import { routeQuestion } from "@/lib/dialogue/routing/modelRouter";
import { resolveRouting } from "@/lib/dialogue/routing/resolve";
import { EXAMPLE_STUDY } from "@/lib/dialogue/routing/sampleDataset";

export const runtime = "nodejs";

type Body = { question?: string };

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }
  const question = typeof body.question === "string" ? body.question : "";
  const trimmed = question.trim().slice(0, 200);
  const routed = await routeQuestion(trimmed);
  const resolved = resolveRouting(routed, trimmed);
  const explain = explainRouting(trimmed || "How do shoppers read Arrives by Friday?", routed);
  return NextResponse.json({
    question: trimmed,
    template: routed.template,
    props: routed.props,
    reason: explain.pickedLine || routed.reason,
    routingLine: formatRoutingLine(routed.path, trimmed, routed),
    path: routed.path,
    data: resolved.data,
    study: EXAMPLE_STUDY,
    explain: {
      queryType: explain.queryTypeLabel,
      dataAvailable: explain.dataAvailable,
      goal: explain.goal,
      template: explain.templateLabel,
    },
  });
}
