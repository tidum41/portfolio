"use client";

/* Dev only, awaiting Mudit's OK (exploration 3, design/dialogue-explorations/ex3-watch-the-chart-get-chosen.md).
   One answer card reshapes as the question changes: split bar, ranked rows, thin-data flag. Who picks the template is an
   open question (OPEN-QUESTIONS 13, 25), so the pick comes from `chooser` and the page never asserts either. */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";
import { answerLayout } from "@/lib/dialogue/product/answerLayout";
import { THIN_FLAG } from "@/lib/dialogue/product/thinCopy";
import "./chart-chosen.css";

/** model: the step's `modelPick` stands for the model's choice. rule: answerLayout plus the under-3-people flag rule. */
export type ChartChooser = "model" | "rule";
/** cut: the card swaps at once. constancy: the bar's marks travel into the rows and shrink into the flag.
 *  staged: old marks fade, the card resizes, new marks fade in (Heer and Robertson staging). */
export type ChartMorph = "cut" | "constancy" | "staged";
export type ChosenKind = "split" | "ranked" | "flag";
export type ChosenGroup = { label: string; value: number; focal?: boolean };
export type ChosenStep = { question: string; title: string; total: number; modelPick: ChosenKind; groups: readonly ChosenGroup[] };

type Props = {
  chooser: ChartChooser;
  morph: ChartMorph;
  steps: readonly ChosenStep[];
  /** Index into steps (controlled). */
  step: number;
};

/** Thin data: under 3 people gets a flag (the page's closing Data viz rule). */
const THIN_UNDER = 3;
export function pickKind(s: ChosenStep, chooser: ChartChooser): ChosenKind {
  if (chooser === "model") return s.modelPick;
  const people = s.groups.reduce((n, g) => n + g.value, 0);
  if (people < THIN_UNDER) return "flag";
  return answerLayout([...s.groups]) === "bar" ? "split" : "ranked";
}

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const tokenMs = (el: Element, name: string) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

function Flag() {
  return (
    <div className="dp-low-signal">
      <InfoCircleIcon className="dp-low-signal__icon" />
      <p className="dp-low-signal__text">{THIN_FLAG}</p>
    </div>
  );
}

/** a and c: the shipped chart components, one per template. */
function Body({ s, kind }: { s: ChosenStep; kind: ChosenKind }) {
  if (kind === "flag") return <Flag />;
  if (kind === "split")
    return <ChartStackedBar lanes total={s.total} segments={s.groups.map((g) => ({ label: g.label, value: g.value, display: `${g.value} of ${s.total}`, focal: g.focal }))} />;
  return (
    <div className="dlg-answer--rows">
      <ChartBarList max={s.groups[0].value} rows={s.groups.map((g) => ({ label: g.label, value: g.value, display: `${g.value} of ${s.total}`, focal: g.focal }))} />
    </div>
  );
}

const MARKS = 5;
type Geo = { x: number; w: number; y: number; h: number; on: boolean };
function geometry(s: ChosenStep, kind: ChosenKind): Geo[] {
  const out: Geo[] = [];
  let acc = 0;
  const max = Math.max(...s.groups.map((g) => g.value), 1);
  for (let i = 0; i < MARKS; i++) {
    const g = s.groups[i];
    if (kind === "flag" || !g) { out.push({ x: 0, w: 0, y: 0, h: kind === "ranked" ? 8 : 24, on: false }); continue; }
    if (kind === "split") { out.push({ x: (acc / s.total) * 100, w: (g.value / s.total) * 100, y: 0, h: 24, on: true }); acc += g.value; }
    else out.push({ x: 0, w: (g.value / max) * 100, y: i * 26 + 5, h: 8, on: true });
  }
  return out;
}

/** b: one set of marks drawn with chart tokens, so each mark can travel between templates. */
function Plot({ s, kind }: { s: ChosenStep; kind: ChosenKind }) {
  const geo = geometry(s, kind);
  return (
    <div className="dlg-dx-chosen__plot" data-kind={kind}>
      {geo.map((m, i) => (
        <span key={i} className="dlg-dx-chosen__mark" data-tone={i === 0 ? "focal" : i < 3 ? "mid" : "soft"} data-on={m.on ? "true" : "false"}
          style={{ "--x": m.x, "--w": m.w, "--y": `${m.y}px`, "--h": `${m.h}px` } as CSSProperties} />
      ))}
      <div className="dlg-dx-chosen__labels" key={`${kind}-${s.question}`}>
        {kind === "split" ? (
          <div className="dlg-dx-chosen__split-labels">
            {s.groups.map((g) => <span key={g.label} data-focal={g.focal ? "true" : undefined}>{g.label} <b>{g.value}</b></span>)}
          </div>
        ) : kind === "ranked" ? (
          s.groups.map((g, i) => (
            <span key={g.label} className="dlg-dx-chosen__row-label" style={{ "--y": `${i * 26}px` } as CSSProperties}>
              <span>{g.label}</span><b data-focal={g.focal ? "true" : undefined}>{g.value} of {s.total}</b>
            </span>
          ))
        ) : (
          <Flag />
        )}
      </div>
    </div>
  );
}

export default function ChartChosen({ chooser, morph, steps, step }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const lastH = useRef<number | null>(null);
  /* staged: the card keeps showing the old step while it fades out, then swaps. */
  const [shown, setShown] = useState(step);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const live = morph === "staged" ? shown : step;

  useEffect(() => {
    if (morph !== "staged" || step === shown) return;
    const el = box.current;
    const fade = el && !reduced() ? tokenMs(el, "--dlg-motion-fade-ms") : 0;
    const t1 = setTimeout(() => setPhase("out"), 0);
    const t2 = setTimeout(() => { setShown(step); setPhase("in"); }, fade);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, shown, morph]);

  /* The card's height follows its content: animated for staged and constancy, a jump for cut and reduced motion. */
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "";
    const to = el.offsetHeight;
    const from = lastH.current;
    lastH.current = to;
    if (from == null || from === to || morph === "cut" || reduced()) return;
    el.style.height = `${from}px`;
    void el.offsetHeight;
    el.style.height = `${to}px`;
    const t = setTimeout(() => { if (box.current) box.current.style.height = ""; }, tokenMs(el, morph === "staged" ? "--dlg-motion-resize-ms" : "--dlg-motion-deeper-ms") + 40);
    return () => clearTimeout(t);
  }, [live, morph]);

  const s = steps[live];
  const kind = pickKind(s, chooser);
  return (
    <div className="dialogue-product-root dlg-dx-chosen" data-morph={morph} data-phase={phase} data-chooser={chooser} data-kind={kind}>
      <div className="dlg-dx-chosen__panel">
        <UserMessageBubble>{steps[step].question}</UserMessageBubble>
        <div ref={box} className="dlg-dx-chosen__box">
          <ChartVizCard title={s.title}>
            <div className="dlg-dx-chosen__body" key={morph === "constancy" ? "plot" : live}>
              {morph === "constancy" ? <Plot s={s} kind={kind} /> : <Body s={s} kind={kind} />}
            </div>
          </ChartVizCard>
        </div>
      </div>
    </div>
  );
}
