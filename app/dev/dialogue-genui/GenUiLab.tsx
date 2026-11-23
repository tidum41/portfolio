"use client";

/* Dev only. Ask one question, run it under two rule sets side by side, and see which template the model picked,
   which rule fired and why. Rules are plain text and editable; presets are in lib/dialogue/genui/catalog.ts.
   URL: ?q=<seed index or text>&a=<preset>&b=<preset>&run=1 asks on load (used for the screenshot run). */
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RULE_PRESETS, SEED_QUESTIONS, TEMPLATES, type PresetId, type Verdict } from "@/lib/dialogue/genui/catalog";
import GenUiAnswer from "./GenUiAnswer";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/depth/DenominatorReveal/denominator-reveal.css";
import "../dialogue-depth/depth-lab.css";
import "./genui-lab.css";

type Result = { question: string; provider: string; model: string; ms: number; weeklyUse: number | null; cached?: boolean; verdict: Verdict };
type Side = { preset: PresetId | "custom"; rules: string; busy: boolean; result: Result | null; error: string | null };

const presetById = (id: string | null) => RULE_PRESETS.find((p) => p.id === id);
const seed = (q: string | null) => (q == null ? SEED_QUESTIONS[0] : /^\d+$/.test(q) ? SEED_QUESTIONS[Number(q)] ?? SEED_QUESTIONS[0] : q);
const newSide = (id: string | null, fallback: PresetId): Side => {
  const p = presetById(id) ?? presetById(fallback)!;
  return { preset: p.id, rules: p.rules, busy: false, result: null, error: null };
};

/** The line of the rules text whose id matches ruleFired, so the reader sees the rule itself. */
function ruleLine(rules: string, id: string) {
  const want = id.trim().toUpperCase();
  if (!want || want === "NONE") return null;
  return rules.split("\n").find((l) => l.trim().toUpperCase().startsWith(`${want} `)) ?? null;
}

function Meta({ side }: { side: Side }) {
  const r = side.result;
  if (side.busy) return <p className="dlg-genui__status" role="status">Asking the model.</p>;
  if (side.error) return <p className="dlg-genui__status">{side.error}</p>;
  if (!r) return <p className="dlg-genui__status">Not asked yet.</p>;
  const v = r.verdict;
  /* On a fallback, still show what the model asked for, so a bad rule is visible. */
  const tried = !v.ok && v.raw && typeof v.raw === "object" ? (v.raw as { template?: string; ruleFired?: string; dataset?: string }) : null;
  return (
    <dl className="dlg-genui__meta">
      <div><dt>Template</dt><dd>{v.ok ? `${v.pick.template}, ${TEMPLATES[v.pick.template].component}` : `text (fallback)${tried?.template ? `, the model asked for ${tried.template}` : ""}`}</dd></div>
      <div><dt>Dataset</dt><dd>{v.ok ? v.pick.dataset : (tried?.dataset ?? "none")}</dd></div>
      <div><dt>Rule fired</dt><dd>{v.ok ? (ruleLine(side.rules, v.pick.ruleFired) ?? v.pick.ruleFired) : tried?.ruleFired ? (ruleLine(side.rules, tried.ruleFired) ?? tried.ruleFired) : "none"}</dd></div>
      <div><dt>Reason</dt><dd>{v.ok ? v.pick.reason : v.error}</dd></div>
      <div><dt>Checks</dt><dd>{v.checks.join(", ")}</dd></div>
      <div><dt>Model</dt><dd>{r.provider}, {r.model}, {(r.ms / 1000).toFixed(1)}s{r.cached ? ", cached" : ""}</dd></div>
    </dl>
  );
}

export default function GenUiLab() {
  const params = useSearchParams();
  const [question, setQuestion] = useState(() => seed(params.get("q")));
  const [sides, setSides] = useState<[Side, Side]>(() => [newSide(params.get("a"), "carbon"), newSide(params.get("b"), "judgment")]);

  const patch = (i: 0 | 1, p: Partial<Side>) => setSides((s) => { const n = [...s] as [Side, Side]; n[i] = { ...n[i], ...p }; return n; });

  const ask = useCallback(async (q: string, current: [Side, Side]) => {
    await Promise.all(([0, 1] as const).map(async (i) => {
      patch(i, { busy: true, error: null });
      try {
        const res = await fetch("/api/dev/dialogue-genui", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q, rules: current[i].rules }) });
        const json = await res.json();
        if (!res.ok) patch(i, { busy: false, error: json.error ?? `HTTP ${res.status}` });
        else patch(i, { busy: false, result: json as Result });
      } catch {
        patch(i, { busy: false, error: "The dev API did not answer." });
      }
    }));
  }, []);

  useEffect(() => {
    if (params.get("run") === "1") void ask(seed(params.get("q")), sides);
    // Run once on load for the screenshot URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="dialogue-product-root dlg-lab dlg-genui">
      <header className="dlg-genui__head">
        <h1 className="dlg-lab__title">Gen-UI rules playground (dev only)</h1>
        <p className="dlg-genui__note">The model picks one template from a fixed catalog and points at Hearthside data. It never writes chart numbers. Output is checked for schema, template fit and invented numbers, and falls back to text if any check fails. Illustrative data.</p>
      </header>
      <form className="dlg-genui__ask" onSubmit={(e) => { e.preventDefault(); void ask(question, sides); }}>
        <label className="dlg-genui__label" htmlFor="genui-q">Research question</label>
        <div className="dlg-genui__row">
          <input id="genui-q" className="dlg-genui__input" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button className="dlg-genui__btn" type="submit" disabled={sides.some((s) => s.busy)}>Ask both</button>
        </div>
        <div className="dlg-lab__steps" aria-label="Seed questions">
          {SEED_QUESTIONS.map((q) => (
            <button key={q} type="button" aria-pressed={q === question} onClick={() => setQuestion(q)}>{q}</button>
          ))}
        </div>
      </form>
      <div className="dlg-genui__grid">
        {sides.map((side, idx) => {
          const i = idx as 0 | 1;
          const p = presetById(side.preset);
          return (
            <section key={i} className="dlg-genui__side" aria-label={`Rule set ${i === 0 ? "left" : "right"}`}>
              <div className="dlg-genui__row">
                <label className="dlg-genui__label" htmlFor={`genui-p${i}`}>Rule set</label>
                <select id={`genui-p${i}`} className="dlg-genui__select" value={side.preset}
                  onChange={(e) => { const n = presetById(e.target.value); if (n) patch(i, { preset: n.id, rules: n.rules, result: null }); }}>
                  {RULE_PRESETS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  {side.preset === "custom" && <option value="custom">Edited</option>}
                </select>
              </div>
              <p className="dlg-genui__note dlg-genui__note--side">{p ? p.note : "Edited by hand."}</p>
              <div className="dlg-genui__stage">
                {side.result ? <GenUiAnswer question={side.result.question} verdict={side.result.verdict} /> : null}
              </div>
              <Meta side={side} />
              <p className="dlg-genui__label">Rules, edit and ask again</p>
              <textarea className="dlg-genui__rules" aria-label="Rules" spellCheck={false} value={side.rules}
                onChange={(e) => patch(i, { rules: e.target.value, preset: "custom" })} rows={Math.max(3, side.rules.split("\n").reduce((n, l) => n + Math.ceil((l.length || 1) / 92), 0) + 1)} />
            </section>
          );
        })}
      </div>
    </main>
  );
}
