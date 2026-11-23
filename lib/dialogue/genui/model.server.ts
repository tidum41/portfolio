/* Dev only. Provider switch for the gen-UI playground. A hosted key wins (Vercel AI SDK, structured output);
   with no key, local dev falls back to the box's Claude Code CLI. The CLI path refuses to run on Vercel or in production. */
import { spawn } from "node:child_process";
import { generateText, Output, type LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { z } from "zod";
import { PickSchema } from "./catalog";

export type ModelRun = { raw: unknown; provider: string; model: string; ms: number; weeklyUse?: number; error?: string };

/** Defaults are free-tier models; override with GENUI_MODEL. No -fast models. */
function hosted(): { provider: string; id: string; model: LanguageModel } | null {
  const want = process.env.GENUI_PROVIDER;
  const pickModel = (d: string) => process.env.GENUI_MODEL || d;
  if ((!want || want === "google") && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const id = pickModel("gemini-3.5-flash-lite");
    return { provider: "google", id, model: createGoogleGenerativeAI()(id) };
  }
  if ((!want || want === "groq") && process.env.GROQ_API_KEY) {
    const id = pickModel("openai/gpt-oss-120b");
    return { provider: "groq", id, model: createGroq()(id) };
  }
  if ((!want || want === "openrouter") && process.env.OPENROUTER_API_KEY) {
    const id = pickModel("openrouter/free");
    const or = createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey: process.env.OPENROUTER_API_KEY, supportsStructuredOutputs: true });
    return { provider: "openrouter", id, model: or(id) };
  }
  if ((!want || want === "gateway") && process.env.AI_GATEWAY_API_KEY) {
    const id = pickModel("google/gemini-3.5-flash-lite");
    return { provider: "gateway", id, model: id };
  }
  return null;
}

const claudeAllowed = () =>
  process.env.NODE_ENV === "development" && !process.env.VERCEL && process.env.GENUI_PROVIDER !== "none";

function claudeCli(instructions: string, question: string): Promise<ModelRun> {
  const model = process.env.GENUI_CLAUDE_MODEL || "sonnet";
  /* The CLI's validator rejects the draft 2020-12 $schema key, so drop it. */
  const { $schema: _drop, ...jsonSchema } = z.toJSONSchema(PickSchema) as Record<string, unknown>;
  void _drop;
  const schema = JSON.stringify(jsonSchema);
  const env = { ...process.env, CLAUDE_CONFIG_DIR: "/home/box/.claude-gmail-full" } as NodeJS.ProcessEnv;
  delete env.CLAUDE_CODE_OAUTH_TOKEN;
  const args = ["-p", question, "--model", model, "--effort", "low", "--tools", "", "--strict-mcp-config", "--setting-sources", "",
    "--system-prompt", instructions, "--json-schema", schema, "--output-format", "stream-json", "--verbose", "--no-session-persistence"];
  const t0 = Date.now();
  return new Promise((resolve) => {
    const child = spawn("claude", args, { cwd: "/tmp", env, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    child.stdout.on("data", (b) => (out += b));
    child.stderr.on("data", (b) => (err += b));
    child.on("error", (e) => (err += e.message));
    const kill = setTimeout(() => child.kill("SIGTERM"), 120_000);
    child.on("close", () => {
      clearTimeout(kill);
      let raw: unknown = null;
      let weeklyUse: number | undefined;
      let error: string | undefined;
      for (const line of out.split("\n")) {
        if (!line.trim()) continue;
        try {
          const ev = JSON.parse(line);
          if (ev.type === "rate_limit_event") weeklyUse = ev.rate_limit_info?.unifiedWindows?.seven_day?.utilization;
          if (ev.type === "result") { raw = ev.structured_output ?? null; if (ev.is_error) error = String(ev.result ?? "error"); }
        } catch { /* partial line */ }
      }
      if (raw == null && !error) error = (err || out).trim().split("\n").slice(-2).join(" ").slice(0, 300) || "Claude Code returned nothing.";
      resolve({ raw, provider: "claude-code (local dev only)", model, ms: Date.now() - t0, weeklyUse, error });
    });
  });
}

export async function runPick(instructions: string, question: string): Promise<ModelRun> {
  const h = hosted();
  if (h) {
    const t0 = Date.now();
    try {
      /* Structured output, then our own zod pass in the route (the model's schema mode is not trusted alone). */
      const res = await generateText({ model: h.model, instructions, prompt: question, output: Output.object({ schema: PickSchema }), temperature: 0 });
      return { raw: res.output, provider: h.provider, model: h.id, ms: Date.now() - t0 };
    } catch (e) {
      return { raw: null, provider: h.provider, model: h.id, ms: Date.now() - t0, error: e instanceof Error ? e.message.slice(0, 300) : "model error" };
    }
  }
  if (claudeAllowed()) return claudeCli(instructions, question);
  return { raw: null, provider: "none", model: "none", ms: 0, error: "No model key. Set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY or AI_GATEWAY_API_KEY." };
}
