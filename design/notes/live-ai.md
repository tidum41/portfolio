# Live version: a free AI model picks and renders a chart from a query (feasibility only)

Nothing here is built. Mudit asked for a feasibility note in Round 16 and said the build is later. Free tiers change their limits and model lists often, so every number below is what I know from the providers' public pricing pages and needs a re-check on the day it is built.

## What the model should do, and what it should not

The model picks. The page renders. Given a typed question, the model returns one small JSON object: a chart template from the set the page already has (stacked bar, bar, ranked bars, trend, thin-data flag), which Hearthside fields it reads, and the one-sentence answer's wording slots. It never sees or writes a number. Counts come from the fixed Hearthside dataset in code, so the page cannot show an invented number (the copy rule), and a wrong pick is a wrong chart type rather than a wrong figure. The existing `ChartStackedBar` and the other chart components render the result with ramp C (cherry focal, teal-70 only for a named second series).

Structured output is the whole job: a schema with an enum for the template, an enum for the field, and a short string for the answer. A small model is enough for that.

## Which free model

| Option | Free allowance (as I know it) | Fit | Catch |
| --- | --- | --- | --- |
| Google Gemini API, a Flash or Flash-Lite model | Free tier with per-minute and per-day request caps, no card | Best at JSON schema output; one key; fast | Free-tier prompts may be used to improve Google's products, which is fine for fictional Hearthside data and not for real interviews |
| Groq, an open model such as Llama 3.x 8B or 70B, or gpt-oss | Free tier with daily token and request caps, no card | Very fast, so the chart can appear in under a second | Caps are tight for a public page; JSON mode is good but not schema-enforced on every model |
| OpenRouter, any `:free` model | A small daily request allowance on free models, more after a small credit top-up | One key reaches many models and can fall back between them | Free models come and go, and latency varies a lot |
| Cloudflare Workers AI | A daily free allowance on the Workers free plan | Runs next to the site if it ever moves to Cloudflare | Smaller model set, weaker at schema output |
| Local model through Ollama | Free, no key, no cap | Good for development and for the demo recording | Cannot run on Vercel, so it is dev only |

Recommendation: Gemini Flash-Lite as the default, with Groq as the fallback when Gemini returns a rate-limit error, and a local Ollama model for development. The Vercel AI SDK (`ai` with `generateObject` and a `zod` schema) takes either provider behind one call, so switching costs a line.

## Keys

- One server-side key per provider (`GEMINI_API_KEY`, `GROQ_API_KEY`), kept as Vercel environment variables for the project, never `NEXT_PUBLIC_`.
- The browser calls the site's own route, never the provider. Nothing secret reaches the client bundle.
- `.env.local` for development, the same as the Sanity IDs already there.
- Keys are Mudit's to create. I cannot create them, and a Cloud Agent run does not have them.

## Cost

$0 on the free tiers at portfolio traffic. A visitor's question is about 300 input tokens (template list and schema, plus the question) and about 60 output tokens, so even a modest free token cap covers hundreds of questions a day. If a post goes viral the free caps run out and the route fails, which is why it needs the fallback below. A paid Flash-Lite call at that size costs a small fraction of a cent, so paying later is cheap if wanted.

## Where it runs

- A Next.js route handler, `app/api/dialogue/chart/route.ts`, on the existing Vercel deployment. Node runtime, not edge, so the provider SDKs and `zod` behave.
- Request: `{ question }`, 200 characters max. Response: the validated JSON object. The client then renders the matching component.
- Guard rails the route needs before it goes public: a per-IP rate limit (Vercel's Runtime Cache or a small KV counter), a length cap, a schema validation on the model's output with one retry, and a timeout of about 5 seconds.
- Fallback when the model errors, times out or hits its cap: a keyword map from the question to the nearest template (the same mapping the data viz section shows), with a line saying it was matched by keyword. The component never shows an empty state.
- Streaming is not needed. The object is tiny and arrives in about a second on Groq or Gemini Flash-Lite.

## Risks and open choices

- **Free-tier terms.** Provider data-use terms differ. Hearthside is fictional, so the question text is the only thing sent. If the live version ever reads a real study, move to a paid or no-training plan first.
- **Prompt injection from the question box.** The output is an enum and a capped string rendered as text, so the worst case is a wrong chart or a silly sentence. Render the sentence as plain text, never as HTML.
- **Wrong pick.** A small model will sometimes pick a trend for a count question. The route can show a "Show as" control with the other templates, which is the existing depth-picker pattern, so a wrong pick costs one tap.
- **Latency on cold start.** First call on a cold function adds about a second. Acceptable for a demo; a skeleton chart card holds the space so nothing reflows (the layout-stable rule).
- **Motion.** A live answer cannot be a recorded take. The page shows it as live UI with the same hover and press states and the same grow animation as the recordings.

## Smallest first build, for later

1. `app/api/dialogue/chart/route.ts` with the schema, Gemini via the AI SDK, and the keyword fallback.
2. A dev-only page that posts a question and renders the chosen template from the Hearthside dataset.
3. Wire the Levels picker's composer to it, so the depth picker take becomes a real interaction on the page.
4. Add the per-IP limit and move it off the dev route.
