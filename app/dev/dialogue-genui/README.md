# /dev/dialogue-genui (dev only)

A playground for the Data viz question "who picks the chart". Ask a research question about the Hearthside mock data, run it under two rule sets side by side, and see which template the model chose, which rule fired and why. Production deployments return 404 for the page and the API.

- Catalog, datasets, presets, zod schema and checks: `lib/dialogue/genui/catalog.ts`. The model returns `{ template, dataset, focal, ruleFired, reason, text }`. It never supplies chart numbers; those come from `components/dialogue/depth/hearthside.ts`.
- Checks before render: zod shape, template-to-data fit (split only when parts add up to the base, compare only with per-group sizes, quotes only with verbatims), and a number guard that rejects any number not in the study data or the rules. Any failure falls back to text and shows what the model asked for.
- Render: existing components only (ChartVizCard, ChartStackedBar, ChartBarList, DenominatorReveal hover counts, the thin-data flag and the ClipQuotes quote-row markup).
- Model (`lib/dialogue/genui/model.server.ts`): Vercel AI SDK with a provider switch. The first key found wins: `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini free tier), `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `AI_GATEWAY_API_KEY`. Force one with `GENUI_PROVIDER` and override the model id with `GENUI_MODEL`. With no key, `next dev` on the box falls back to the local Claude Code CLI (Sonnet, effort low). That path refuses to run on Vercel or outside development.
- URL: `?q=<seed index or text>&a=<preset>&b=<preset>&run=1` asks on load. Presets: carbon, judgment, evidence, stress.
- Answers are cached by question plus rules (in memory, and in /tmp in local dev).
