"use client";

/* Dev only. Explorations 2, 3 and 5 (design/dialogue-explorations/). ?ex=2|3|5, ?opt=a|b|c for one option,
   ?auto=1 runs the recorded storyboard. Explorations 1 and 4 were cut in review/dialogue-reset-r1 (Not approved,
   ex1-ex4-review.md); their code is in git history before that branch. */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import DenominatorReveal, { type DenominatorRevealOption, type DenominatorRevealPhase } from "@/components/dialogue/depth/DenominatorReveal/DenominatorReveal";
import ChartChosen, { type ChartChooser, type ChartMorph } from "@/components/dialogue/depth/ChartChosen/ChartChosen";
import LiveFigure, { type LiveSignal } from "@/components/dialogue/depth/LiveFigure/LiveFigure";
import { CHOSEN_STEPS, BY_GROUP, BY_GROUP_TITLE, FRIDAY_FINDING, FRIDAY_QUESTION, FRIDAY_SIDES, FRIDAY_TOTAL } from "@/components/dialogue/depth/hearthside";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/depth/DenominatorReveal/denominator-reveal.css";
import "@/components/dialogue/depth/EvidenceLayer/evidence-layer.css"; /* exploration 5 LiveFigure renders EvidenceLayer */
import "./depth-lab.css";

type OptKey = "a" | "b" | "c";
const EX2: Record<OptKey, { option: DenominatorRevealOption; name: string; differs: string }> = {
  a: { option: "relabel", name: "a. Relabel in place", differs: "Geometry stays fixed. Only the label cuts from percent to people." },
  b: { option: "rescale", name: "b. Track resizes to its group", differs: "Label cuts, then each track resizes to its group size on one people scale (staged, 400ms)." },
  c: { option: "units", name: "c. A dot per person", differs: "The percent bar is replaced by one dot per person. Marks swap, they never morph." },
};
/* Story proposals (design/dialogue-explorations/STORY-CHANGES.md). Dev only, never on /dialogue. */
const PROPOSALS: readonly { id: string; where: string; old: string; proposed: string }[] = [
  { id: "P1", where: "Data viz body", old: "The chart follows a rule I wrote.", proposed: "If the model picks: The model picks the chart from templates I designed, and a rule I wrote handles long labels. [PLACEHOLDER] until the model-or-rule question closes." },
  { id: "P2", where: "Data viz, new figure", old: "(no figure)", proposed: "One adapted Carbon rule shown beside the 448px bar. Caption [PLACEHOLDER] until the Carbon page is quoted." },
  { id: "P3", where: "Problem, second figure", old: "(one figure, the hidden count)", proposed: "The comparison pooled counts hide: 64% and 70% bars alone. Illustrative data." },
  { id: "P4", where: "Levels h2", old: "Every level at once was too slow, so depth became optional", proposed: "Every level at once lost the count, so depth became optional" },
  { id: "P5", where: "Levels or Counts, new figure", old: "(text only)", proposed: "The before path to a person beside one tap on the bar. Hop count [PLACEHOLDER]. No timing numbers." },
];

const EX3: Record<OptKey, { morph: ChartMorph; name: string; differs: string }> = {
  a: { morph: "cut", name: "a. Cut", differs: "The question line changes and the card swaps whole, at once. Height jumps." },
  b: { morph: "constancy", name: "b. Marks travel (object constancy)", differs: "One set of marks: the bar's segments travel into rows, then shrink into the flag. 400ms." },
  c: { morph: "staged", name: "c. Staged fade", differs: "Old marks fade (110ms), then the card resizes (240ms) while new rows fade in 20ms apart. About 350ms." },
};
const CHOOSER_NOTE: Record<ChartChooser, string> = {
  model: "[PLACEHOLDER] Who picks the chart in real Dialogue is open (OQ 13, 25). This view: chooser = model, the template is the step's model pick.",
  rule: "[PLACEHOLDER] Who picks the chart in real Dialogue is open (OQ 13, 25). This view: chooser = rule, answerLayout (two groups with short labels keep the bar, else rows) and under 3 people gets the flag.",
};
const EX3_STEP_MS = 2200;

function Ex3Cell({ k, chooser, auto }: { k: OptKey; chooser: ChartChooser; auto: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((n) => (n + 1) % CHOSEN_STEPS.length), EX3_STEP_MS);
    return () => clearInterval(t);
  }, [auto]);
  const o = EX3[k];
  return (
    <section className="dlg-lab__cell" data-ex="3" data-opt={k}>
      <h2 className="dlg-lab__name">{o.name}</h2>
      <p className="dlg-lab__differs">{o.differs}</p>
      <DialogueRachelFrame tone="system">
        <div className="dlg-lab__panel dlg-lab__panel--pad">
          <ChartChosen chooser={chooser} morph={o.morph} steps={CHOSEN_STEPS} step={step} />
        </div>
      </DialogueRachelFrame>
      <p className="dlg-lab__placeholder">{CHOOSER_NOTE[chooser]}</p>
      <nav className="dlg-lab__steps">{CHOSEN_STEPS.map((st, i) => <button key={st.question} type="button" aria-pressed={i === step} onClick={() => setStep(i)}>{st.question}</button>)}</nav>
    </section>
  );
}

const EX5: Record<"a" | "b", { signal: LiveSignal; name: string; differs: string }> = {
  a: { signal: "control", name: "a. Container control", differs: "The take plays. A control on the well (top left, like the play button) swaps in the live UI." },
  b: { signal: "ghost", name: "b. First-view demo tap", differs: "The live UI is the default. On first view a demo pointer taps 225 once, then hands over." },
};
/* Proposed copy for the control (STORY-CHANGES.md). Dev only. */
const CONTROL_LABELS = { live: "Try it", take: "Watch the take" };

function Ex5Cell({ k }: { k: "a" | "b" }) {
  const o = EX5[k];
  return (
    <section className="dlg-lab__cell" data-ex="5" data-opt={k}>
      <h2 className="dlg-lab__name">{o.name}</h2>
      <p className="dlg-lab__differs">{o.differs}</p>
      <DialogueRachelFrame tone="solution">
        <LiveFigure signal={o.signal} take={{ src: "/dialogue/motion/live-side.mp4", poster: "/dialogue/motion/live-side.jpg", label: "Tapping 75 swaps the 225 shoppers for the 75 unsure, and tapping 225 swaps them back" }}
          question={FRIDAY_QUESTION} finding={FRIDAY_FINDING} total={FRIDAY_TOTAL} sides={FRIDAY_SIDES} controlLabels={CONTROL_LABELS} />
      </DialogueRachelFrame>
    </section>
  );
}

const KEYS: readonly OptKey[] = ["a", "b", "c"];

function Ex2Cell({ k }: { k: OptKey }) {
  const [phase, setPhase] = useState<DenominatorRevealPhase>("rate");
  /* The cell remounts on each replay (keyed by run), so the phase always starts on the percents. */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setPhase("people"), reduce ? 0 : 1200);
    return () => clearTimeout(t);
  }, []);
  const o = EX2[k];
  return (
    <section className="dlg-lab__cell" data-ex="2" data-opt={k}>
      <h2 className="dlg-lab__name">{o.name}</h2>
      <p className="dlg-lab__differs">{o.differs}</p>
      <DialogueRachelFrame tone="system">
        <div className="dlg-lab__panel">
          <DenominatorReveal option={o.option} title={BY_GROUP_TITLE} groups={BY_GROUP} phase={phase} />
        </div>
      </DialogueRachelFrame>
    </section>
  );
}

export default function DepthLab() {
  const params = useSearchParams();
  const rawEx = params.get("ex");
  const ex = rawEx === "3" ? 3 : rawEx === "5" ? 5 : 2;
  const chooser: ChartChooser = params.get("chooser") === "model" ? "model" : "rule";
  const rawOpt = params.get("opt");
  const only = KEYS.find((k) => k === rawOpt);
  const auto = params.get("auto") === "1";
  const [run, setRun] = useState(0);
  /* Exploration 2 replays on a loop when recording, so a clip shows the reveal more than once. */
  useEffect(() => {
    if (!auto || ex !== 2) return;
    const t = setInterval(() => setRun((r) => r + 1), 4200);
    return () => clearInterval(t);
  }, [auto, ex]);
  if (rawEx === "story") {
    return (
      <main className="dialogue-product-root dlg-lab">
        <p className="dlg-lab__title">Story proposals (dev only; Mudit writes the story, none of this is on /dialogue)</p>
        <div className="dlg-lab__proposals">
          {PROPOSALS.map((p) => (
            <section key={p.id} className="dlg-lab__proposal">
              <p className="dlg-lab__tag">Proposal {p.id} · {p.where}</p>
              <p className="dlg-lab__old">Now: {p.old}</p>
              <p className="dlg-lab__new">Proposed: {p.proposed}</p>
            </section>
          ))}
        </div>
      </main>
    );
  }
  if (rawEx === "hover") {
    /* Round 3 take stage: one well, one card, cropped by scripts/record-dialogue-depth-hover.mjs. */
    const opt = rawOpt === "b" ? "hover-percents" : "hover-counts";
    return (
      <main className="dialogue-product-root dlg-lab dlg-lab--stage">
        <div id="frame" className="dlg-lab__stage">
          <DialogueRachelFrame tone="system">
            <div className="dlg-lab__panel dlg-lab__panel--pad">
              <DenominatorReveal option={opt} title={BY_GROUP_TITLE} groups={BY_GROUP} />
            </div>
          </DialogueRachelFrame>
        </div>
      </main>
    );
  }
  const keys = only ? [only] : ex === 5 ? (["a", "b"] as const) : KEYS;
  return (
    <main className="dialogue-product-root dlg-lab" data-ex={ex}>
      <header className="dlg-lab__bar">
        <p className="dlg-lab__title">Dialogue depth, exploration {ex === 2 ? "2: denominator reveal" : ex === 3 ? "3: watch the chart get chosen" : "5: one live figure"} (dev only, awaiting Mudit&rsquo;s OK)</p>
        <nav className="dlg-lab__nav">
          <a href="?ex=2">Ex 2</a>
          <a href="?ex=3">Ex 3</a>
          <a href="?ex=5">Ex 5</a>
          {ex === 3 ? (["rule", "model"] as const).map((c) => <a key={c} href={`?ex=3&chooser=${c}${only ? `&opt=${only}` : ""}`} aria-current={c === chooser || undefined}>chooser {c}</a>) : null}
          <a href="?ex=story">Story proposals</a>
          {ex === 2 ? <button type="button" onClick={() => setRun((r) => r + 1)}>Replay</button> : null}
        </nav>
      </header>
      <div className="dlg-lab__grid" data-count={keys.length}>
        {keys.map((k) => (ex === 3 ? <Ex3Cell key={k} k={k} chooser={chooser} auto={auto} /> : ex === 5 ? <Ex5Cell key={k} k={k === "c" ? "b" : k} /> : <Ex2Cell key={`${k}-${run}`} k={k} />))}
      </div>
    </main>
  );
}
