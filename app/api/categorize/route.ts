// Ported from tidum41/allinone-demo api/categorize.js for the vendored demo at /allinone-demo.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FALLBACK_CATEGORIES = [
  { name: 'school', description: 'classes, readings, quizzes, coursework' },
  { name: 'product design', description: 'portfolio, wireframes, research, design work' },
  { name: 'involvement', description: 'clubs, volunteering, community, events' },
  { name: 'home', description: 'chores, groceries, errands, apartment stuff' },
  { name: 'personal', description: 'health, friends, self-care, appointments' },
  { name: 'thinking', description: 'loose ideas, half-formed plans, things to explore someday' },
]

type CategoryInput = { name?: string; description?: string }

function buildSystemPrompt(categories: CategoryInput[]) {
  const list = categories.length > 0 ? categories : FALLBACK_CATEGORIES
  const categoryBlock = list
    .filter((c) => c?.name)
    .map((c) => {
      const name = String(c.name).trim()
      const desc = String(c.description || '').trim()
      return desc ? `- ${name}: ${desc}` : `- ${name}`
    })
    .join('\n')

  const names = list.map((c) => String(c.name || '').trim()).filter(Boolean)
  const exampleCat = names.find((n) => n.toLowerCase() !== 'thinking') || names[0] || 'product design'
  const thinkingCat = names.find((n) => n.toLowerCase() === 'thinking') || 'thinking'

  return `You are a task categorization assistant. Your job is to read a freeform note blob, extract individual tasks, lightly clean their formatting, assign each one to exactly one category, and assign a priority level.

CATEGORIES (use these exact names — the descriptions are the user's definitions of what belongs in each):
${categoryBlock}

PRIORITY LEVELS (do not assign to "${thinkingCat}"):
- Urgent: Needs to happen very soon, time-sensitive, deadlines implied
- Soon: Should happen in the near future but not immediately critical
- Eventually: No urgency, would be nice to do, no deadline implied

FORMATTING RULES:
- Preserve the user's exact wording and casing for task text. Do NOT change capitalization of the task text.
- Category names must match the list above exactly (including lowercase).
- Strip bullet characters. Each task is its own object.
- Do not merge tasks. Do not invent tasks not in the blob.
- "${thinkingCat}" items get priority: null

OUTPUT: Respond only with a JSON object of the form {"tasks":[...]}. No explanation, no markdown fences. Example:
{
  "tasks": [
    { "id": "a1b2c3d4", "text": "finish wireframes for hero onboarding", "category": "${exampleCat}", "priority": "Soon" },
    { "id": "e5f6g7h8", "text": "think about switching to a smaller studio", "category": "${thinkingCat}", "priority": null }
  ]
}`
}

// Groq shut down llama-3.1-8b-instant for free/developer tiers on 2026-08-16.
// Official replacement: openai/gpt-oss-20b. Qwen is available as GROQ_MODEL=qwen/qwen3.8-27b.
const DEFAULT_MODEL = 'openai/gpt-oss-20b'

const TASK_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          category: { type: 'string' },
          priority: { type: ['string', 'null'] },
        },
        required: ['id', 'text', 'category', 'priority'],
        additionalProperties: false,
      },
    },
  },
  required: ['tasks'],
  additionalProperties: false,
}

// Simple in-memory rate limiting (resets on cold start — fine for a demo)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>() // ip → { count, resetAt }
const RATE_LIMIT = 8           // requests per window
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function extractTasks(raw: unknown, categoryNames: string[]) {
  const cleaned = String(raw || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  const parsed = JSON.parse(cleaned)
  const list = Array.isArray(parsed) ? parsed : parsed?.tasks
  if (!Array.isArray(list)) {
    throw new Error('Model did not return a task list')
  }
  const byLower = new Map(categoryNames.map((n) => [n.toLowerCase(), n]))
  const fallback = byLower.get('thinking') || categoryNames[categoryNames.length - 1] || 'thinking'

  return list.map((task: any) => {
    const rawCat = String(task.category || '').trim()
    const category = byLower.get(rawCat.toLowerCase()) || fallback
    const isThinking = category.toLowerCase() === 'thinking'
    return {
      id: task.id || makeId(),
      text: String(task.text || '').trim(),
      category,
      priority: isThinking ? null : (task.priority ?? null),
    }
  }).filter((task) => task.text)
}

function groqErrorMessage(status: number, body: string) {
  let parsed: any
  try { parsed = JSON.parse(body) } catch { parsed = null }
  const message = parsed?.error?.message || parsed?.error || ''
  const text = String(message).toLowerCase()

  if (status === 401 || text.includes('invalid api key')) {
    return 'Categorization API key is invalid. Check GROQ_API_KEY.'
  }
  if (status === 404 || /decommission|deprecated|model_not_found|does not exist|no longer/i.test(text)) {
    return 'Categorization model is no longer available. Set GROQ_MODEL to a current Groq model.'
  }
  if (status === 429) {
    return 'Categorization rate limit reached. Try again shortly.'
  }
  return 'Categorization failed'
}

const json = (data: unknown, status = 200) => Response.json(data, { status })

type Rule = { taskText: string; correctedCategory: string }

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return json({ error: 'Rate limit reached. Try again in an hour.' }, 429)
  }

  let reqBody: { text?: string; categoryRules?: Rule[]; categories?: CategoryInput[] } = {}
  try { reqBody = await req.json() } catch { reqBody = {} }
  const { text, categoryRules = [], categories = [] } = reqBody
  if (!text?.trim()) {
    return json({ error: 'No text provided' }, 400)
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set')
    return json({ error: 'Categorization is not configured. Set GROQ_API_KEY.' }, 500)
  }

  const resolvedCategories = (Array.isArray(categories) && categories.length > 0
    ? categories
    : FALLBACK_CATEGORIES
  ).filter((c) => c?.name)

  const categoryNames = resolvedCategories.map((c) => String(c.name).trim())
  const systemPrompt = buildSystemPrompt(resolvedCategories)

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL
  const learnedCorrections = categoryRules.length > 0
    ? `\n\nThe user has made these manual corrections before — use them:\n${categoryRules.map(r => `- "${r.taskText}" → "${r.correctedCategory}"`).join('\n')}`
    : ''

  const payload: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt + learnedCorrections },
      { role: 'user', content: `Here is my note blob. Extract and categorize all tasks:\n\n${text}` },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'categorized_tasks', strict: true, schema: TASK_SCHEMA },
    },
  }
  // gpt-oss models default to medium reasoning, which burns tokens on a simple sort
  if (model.startsWith('openai/gpt-oss')) payload.reasoning_effort = 'low'

  const callGroq = (b: unknown) => fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(b),
  })

  let groqRes: Response
  try {
    groqRes = await callGroq(payload)
    if (!groqRes.ok) {
      const err = await groqRes.text()
      // Some Groq models reject json_schema; retry with prompt-only JSON.
      if (groqRes.status === 400 && /response_format|json_schema|schema/i.test(err)) {
        const { response_format: _ignored, ...rest } = payload
        groqRes = await callGroq(rest)
      } else {
        console.error('Groq error:', groqRes.status, err)
        return json({ error: groqErrorMessage(groqRes.status, err) }, 502)
      }
    }
  } catch (e) {
    console.error('Groq fetch error:', e)
    return json({ error: 'Could not reach categorization service' }, 502)
  }

  if (!groqRes.ok) {
    const err = await groqRes.text()
    console.error('Groq error:', groqRes.status, err)
    return json({ error: groqErrorMessage(groqRes.status, err) }, 502)
  }

  const data = await groqRes.json()
  const raw = data.choices?.[0]?.message?.content || ''
  try {
    return json(extractTasks(raw, categoryNames))
  } catch {
    console.error('Failed to parse Groq response:', raw)
    return json({ error: 'Invalid response from model' }, 502)
  }
}
