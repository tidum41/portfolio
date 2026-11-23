/* Dev only: POST { question, rules } -> the model's pick, validated. 404 on production deployments
   (same gate as app/dev/dialogue-depth). Answers are cached in memory by question plus rules, so re-shooting a
   screenshot does not spend another model call. */
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { buildInstructions, validatePick } from "@/lib/dialogue/genui/catalog";
import { runPick } from "@/lib/dialogue/genui/model.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isProd = () => process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production";
/* Local dev keeps the cache on disk too, so a hot reload or restart does not spend another call. Never on Vercel. */
const CACHE_FILE = "/tmp/dialogue-genui-cache.json";
const disk = () => !process.env.VERCEL;
const cache = new Map<string, unknown>(disk() && existsSync(CACHE_FILE) ? Object.entries(JSON.parse(readFileSync(CACHE_FILE, "utf8"))) : []);
const save = () => { if (disk()) writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(cache))); };

export async function POST(req: Request) {
  if (isProd()) return new NextResponse(null, { status: 404 });
  const body = (await req.json().catch(() => null)) as { question?: unknown; rules?: unknown; fresh?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 300) : "";
  const rules = typeof body?.rules === "string" ? body.rules.slice(0, 4000) : "";
  if (!question) return NextResponse.json({ error: "Ask a question." }, { status: 400 });
  const key = createHash("sha256").update(`${question}\n---\n${rules}`).digest("hex");
  if (!body?.fresh && cache.has(key)) return NextResponse.json({ ...(cache.get(key) as object), cached: true });

  const run = await runPick(buildInstructions(rules), question);
  const verdict = run.raw == null ? { ok: false as const, error: run.error ?? "The model returned no JSON.", raw: null, checks: ["schema: no output"] } : validatePick(run.raw, rules);
  const out = { question, provider: run.provider, model: run.model, ms: run.ms, weeklyUse: run.weeklyUse ?? null, verdict };
  if (run.raw != null) { cache.set(key, out); save(); }
  return NextResponse.json(out);
}
