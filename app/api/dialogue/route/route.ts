import { NextResponse } from "next/server";
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
  const routed = await routeQuestion(question);
  const resolved = resolveRouting(routed);
  return NextResponse.json({
    question: question.trim().slice(0, 200),
    template: routed.template,
    props: routed.props,
    reason: routed.reason,
    path: routed.path,
    data: resolved.data,
    study: EXAMPLE_STUDY,
  });
}
