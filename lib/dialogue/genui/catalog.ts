/* Dev only: the gen-UI playground at /dev/dialogue-genui. The model may choose a template from a fixed catalog and point at
   a Hearthside dataset by id. It never supplies numbers: every count comes from components/dialogue/depth/hearthside.ts.
   Output is validated three ways before anything renders (zod shape, template-to-data fit, number guard); any failure
   falls back to a text answer. Shared by the client page and the server route. */
import { z } from "zod";
import { BY_GROUP, BY_GROUP_TITLE, CHOSEN_STEPS, FRIDAY_SIDES, FRIDAY_TOTAL } from "@/components/dialogue/depth/hearthside";

/** The catalog: each id maps to an existing approved chart component (see GenUiAnswer.tsx). */
export const TEMPLATES = {
  split: { component: "ChartStackedBar", use: "One bar split into parts of a single base, counts on each part (part-to-whole)." },
  ranked: { component: "ChartBarList", use: "Sorted rows of themes by people count, each read out of the study base." },
  compare: { component: "DenominatorReveal (hover counts)", use: "Two groups of different sizes, each counted out of its own group size; percent on hover." },
  quotes: { component: "Quote rows (ClipQuotes markup)", use: "Verbatims: name, timecode and the words, no chart." },
  flag: { component: "Thin-data flag (dp-low-signal)", use: "A quiet early-signal line in place of a chart." },
  text: { component: "Plain text", use: "A one or two sentence answer with no chart." },
} as const;
export type TemplateId = keyof typeof TEMPLATES;
export const TEMPLATE_IDS = Object.keys(TEMPLATES) as [TemplateId, ...TemplateId[]];

type Group = { label: string; value: number; of?: number };
export type Dataset = {
  id: DatasetId;
  about: string;
  title: string;
  base: number;
  groups: readonly Group[];
  /** True when the groups add up to the base, so a part-to-whole is honest. */
  sumsToBase: boolean;
  people?: readonly { name: string; time: string; quote: string; side: string }[];
};

const [splitStep, asksStep, missedStep] = CHOSEN_STEPS;
const sideRows = (["friday", "unsure"] as const).flatMap((side) =>
  FRIDAY_SIDES[side].people.map((p) => ({ name: p.name, time: `${p.time}-${p.end}`, quote: p.quote, side: FRIDAY_SIDES[side].label })),
);

export const DATASET_IDS = ["friday_read", "asks_top5", "by_group", "missed_delivery"] as const;
export type DatasetId = (typeof DATASET_IDS)[number];
export const DATASETS: Record<DatasetId, Dataset> = {
  friday_read: {
    id: "friday_read",
    about: "How shoppers read 'Arrives by Friday': as this Friday, or unsure. Each side has quotes.",
    title: splitStep.title,
    base: FRIDAY_TOTAL,
    groups: splitStep.groups.map((g) => ({ label: g.label, value: g.value })),
    sumsToBase: true,
    people: sideRows,
  },
  asks_top5: {
    id: "asks_top5",
    about: "What shoppers asked for after checkout, top five themes. A shopper can be in more than one theme or none.",
    title: asksStep.title,
    base: asksStep.total,
    groups: asksStep.groups.map((g) => ({ label: g.label, value: g.value })),
    sumsToBase: false,
  },
  by_group: {
    id: "by_group",
    about: "Read 'Arrives by Friday' as this Friday, split by new versus repeat shoppers. The groups are different sizes and each is counted out of its own size.",
    title: BY_GROUP_TITLE,
    base: FRIDAY_TOTAL,
    groups: BY_GROUP.map((g) => ({ label: g.label, value: g.count, of: g.of })),
    sumsToBase: false,
  },
  missed_delivery: {
    id: "missed_delivery",
    about: "Shoppers who said they missed a delivery.",
    title: missedStep.title,
    base: missedStep.total,
    groups: missedStep.groups.map((g) => ({ label: g.label, value: g.value })),
    sumsToBase: false,
  },
};

/** What the model must return. Nullable, not optional, so strict JSON-schema modes (OpenAI, Groq) accept it. */
export const PickSchema = z.object({
  template: z.enum(TEMPLATE_IDS).describe("One template id from the catalog."),
  dataset: z.enum([...DATASET_IDS, "none"]).describe("The dataset id the answer draws on, or none."),
  focal: z.string().nullable().describe("The one group label the answer is about (gets the cherry mark), or null."),
  ruleFired: z.string().max(40).describe("The id of the rule that decided the template, e.g. R4, or 'none' if you used judgment."),
  reason: z.string().min(1).max(200).describe("One line: why this template answers this question."),
  text: z.string().max(280).nullable().describe("Only for template text: one or two sentences. Use only numbers from the dataset."),
});
export type Pick = z.infer<typeof PickSchema>;

/** Numbers the model may write: every value in the study data plus any number in the rules text. */
function allowedNumbers(rules: string): Set<string> {
  const out = new Set<string>();
  for (const d of Object.values(DATASETS)) {
    out.add(String(d.base));
    for (const g of d.groups) { out.add(String(g.value)); if (g.of) out.add(String(g.of)); }
    for (const p of d.people ?? []) for (const n of p.time.match(/\d+/g) ?? []) out.add(String(Number(n)));
  }
  for (const n of rules.match(/\d+/g) ?? []) out.add(String(Number(n)));
  return out;
}
const numbersIn = (s: string) => (s.replace(/\bR\d+\b/g, "").match(/\d+(?:\.\d+)?/g) ?? []).map((n) => String(Number(n)));

/** Can this template draw this dataset at all? A wrong pick is reported, not silently fixed. */
function fit(template: TemplateId, d: Dataset | null): string | null {
  if (template === "text") return null;
  if (!d) return `${template} needs a dataset`;
  if (template === "split" && !d.sumsToBase) return `split needs parts that add up to the base; ${d.id} does not`;
  if (template === "compare" && !d.groups.every((g) => g.of)) return `compare needs each group's own size; ${d.id} has one base`;
  if (template === "quotes" && !d.people?.length) return `quotes needs verbatims; ${d.id} has none in the mock data`;
  return null;
}

export type Verdict =
  | { ok: true; pick: Pick; dataset: Dataset | null; checks: string[] }
  | { ok: false; error: string; raw: unknown; checks: string[] };

export function validatePick(raw: unknown, rules: string): Verdict {
  const checks: string[] = [];
  const parsed = PickSchema.safeParse(raw);
  if (!parsed.success) {
    checks.push("schema: failed");
    return { ok: false, error: `Schema: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`, raw, checks };
  }
  checks.push("schema: ok");
  const pick = parsed.data;
  const d = pick.dataset === "none" ? null : DATASETS[pick.dataset];
  const misfit = fit(pick.template, d);
  if (misfit) { checks.push("fit: failed"); return { ok: false, error: `Fit: ${misfit}`, raw, checks }; }
  checks.push("fit: ok");
  if (pick.focal && d && !d.groups.some((g) => g.label === pick.focal)) checks.push(`focal "${pick.focal}" is not a label, ignored`);
  const allowed = allowedNumbers(rules);
  const bad = numbersIn(`${pick.reason} ${pick.text ?? ""}`).filter((n) => !allowed.has(n));
  if (bad.length) { checks.push("numbers: failed"); return { ok: false, error: `Invented number: ${bad.join(", ")} is not in the study data`, raw, checks }; }
  checks.push("numbers: ok");
  return { ok: true, pick, dataset: d, checks };
}

/** The prompt is the catalog plus the data plus the rules. The rules text is the only part Mudit edits. */
export function buildInstructions(rules: string): string {
  const cat = TEMPLATE_IDS.map((t) => `- ${t}: ${TEMPLATES[t].use}`).join("\n");
  const data = DATASET_IDS.map((id) => {
    const d = DATASETS[id];
    const groups = d.groups.map((g) => `${g.label} ${g.value} of ${g.of ?? d.base}`).join("; ");
    const people = d.people ? ` Verbatims: ${d.people.map((p) => `${p.name} (${p.side})`).join(", ")}.` : "";
    return `- ${id}: ${d.about} Base ${d.base} shoppers. Groups: ${groups}.${d.sumsToBase ? " Groups add up to the base." : " Groups do not add up to the base."}${people}`;
  }).join("\n");
  return [
    "You choose how a research chat answer is shown. The study is Hearthside (illustrative mock data): 300 shopper interviews about checkout.",
    "Pick exactly one template from the catalog and one dataset. You never write chart numbers; the app reads them from the dataset.",
    "",
    "Catalog:",
    cat,
    "",
    "Datasets:",
    data,
    "",
    "Rules (follow them in order; the first rule that applies decides):",
    rules.trim() || "(no rules: use your judgment)",
    "",
    "Return JSON only. ruleFired is the id of the rule that decided the template, or none. reason is one plain line. text is null unless template is text.",
  ].join("\n");
}

export const RULE_PRESETS = [
  {
    id: "carbon",
    name: "A. Carbon-derived (seed)",
    note: "The rules the knowledge pack implies (PLATFORM.md section 5, CR, MOCK-DATA.md).",
    rules: [
      "R1 Thin data: if the people behind the answer number under 3, use flag, never a chart. [PLACEHOLDER: why the cutoff is 3]",
      "R2 Verbatims: if the question asks what people said, their words, or why, use quotes.",
      "R3 Different-size groups: if the question compares groups of different sizes, use compare so each group is counted out of its own size.",
      "R4 Part-to-whole: use split only when the parts add up to the base.",
      "R5 Themes: if the parts do not add up to the base, use ranked rows, sorted, rank one is focal.",
      "R6 Counts first: every mark reads as N of base; a percent never stands alone.",
      "R7 One chart per answer. If nothing fits, use text.",
      "R8 [PLACEHOLDER: how Dialogue matched a question to a template in production, model or a rule Mudit wrote]",
    ].join("\n"),
  },
  {
    id: "judgment",
    name: "B. Model judgment, no rules",
    note: "The catalog and the data only. Shows what the model does when nothing constrains it.",
    rules: "R0 Use your own judgment to pick whichever template looks clearest.",
  },
  {
    id: "evidence",
    name: "C. Evidence first",
    note: "Research-team priority (TASTE Nov 22): verbatims and clips, then segment comparison.",
    rules: [
      "R1 Thin data: under 3 people, use flag.",
      "R2 Evidence first: whenever a dataset has verbatims, show quotes, even for a how-many question.",
      "R3 Different-size groups: use compare.",
      "R4 Part-to-whole only when the parts add up to the base; otherwise ranked.",
    ].join("\n"),
  },
  {
    id: "stress",
    name: "D. Always one bar (stress test)",
    note: "A bad rule on purpose, to show the fit check catch a part-to-whole that does not add up and fall back to text.",
    rules: "R1 Always use split, one bar, whatever the data.",
  },
] as const;
export type PresetId = (typeof RULE_PRESETS)[number]["id"];

/** Seed questions for the proof run (each maps onto existing Hearthside data). */
export const SEED_QUESTIONS = [
  "Did new shoppers read Friday differently from repeat shoppers?",
  "Did anyone miss a delivery?",
  "How many shoppers read 'Arrives by Friday' which way?",
  "What did shoppers actually say about 'Arrives by Friday'?",
  "What did shoppers ask for after checkout?",
] as const;
