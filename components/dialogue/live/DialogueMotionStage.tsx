"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, ChevronUpIcon, LoaderArcIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { PARAGRAPH_ANSWER_WALL, QUOTE_LIST } from "@/lib/dialogue/product/sampleData";

/*
 * P11 motion stage: one storyboard per case-study video (build/p11-motion-spec.md, design/TASTE.md "Motion").
 * The recorder (scripts/record-dialogue-motion.mjs) drives it through window.__dlg; the page never
 * scrolls itself. New content grows below the tapped element (400 ms, cubic-bezier(0.2, 0, 0, 1)),
 * entrances fade and rise 8 px (350 ms), nothing pops. Hearthside mock data, same as the page.
 */
export type MotionDemo = "hero" | "side" | "clip" | "before" | "every" | "picker" | "toggles";

const QUESTION = "How do shoppers read \u201cArrives by Friday\u201d?";
const FINDING = "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";
const LEVELS = ["Insight", "Chart", "People", "Source"] as const;
const MEI = QUOTE_LIST[0];

/* Height grows via grid rows (0fr→1fr open, fade then fold on close). Panel size stays fixed; its body scrolls. */
function Grow({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); setLeaving(false); return; }
    if (!mounted) return;
    setLeaving(true);
    // Fade 150ms then fold 300ms; unmount after 450ms (P14 item 8).
    const t = setTimeout(() => { setMounted(false); setLeaving(false); }, 450);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!mounted) return null;
  return (
    <div className={["dlg-grow", leaving ? "dlg-grow--out" : "dlg-grow--in", className].filter(Boolean).join(" ")}>
      <div className="dlg-grow__inner">{children}</div>
    </div>
  );
}

/* Keep the newest content in view: ease the panel body's scroll (600 ms ease-in-out), never a snap. */
/* cubic-bezier(0.4, 0, 0.2, 1), sampled */
const ease = (p: number) => { let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; const x = 3 * 0.4 * m * (1 - m) ** 2 + 3 * 0.2 * m * m * (1 - m) + m ** 3; if (x < p) lo = m; else hi = m; } const m = (lo + hi) / 2; return 3 * m * m * (1 - m) + m ** 3; };
function follow(ms = 500, up = false) {
  const body = document.querySelector<HTMLElement>(".dlg-stage__body");
  if (!body) return;
  const from = body.scrollTop, to = up ? 0 : body.scrollHeight - body.clientHeight;
  if (Math.abs(to - from) <= 1) return;
  const t0 = performance.now();
  const step = (now: number) => { const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
function clipRange(time: string): CSSProperties {
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const total = sec("42:10");
  return { ["--clip-a" as string]: `${(a / total) * 100}%`, ["--clip-w" as string]: `${((z - a) / total) * 100}%` } as CSSProperties;
}

function AnswerCard({ segment = false, onSide, sideOpen, chart = true }: { segment?: boolean; onSide?: () => void; sideOpen?: boolean; chart?: boolean }) {
  const bar = (
      <div className="dlg-live__bar">
        <ChartStackedBar
          total={300}
          segments={[
            { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
            { label: "Unsure", value: 75, display: "75 of 300" },
          ]}
        />
        <button type="button" className="dlg-live__side" data-target="side" aria-label="Open the 75 unsure" aria-expanded={!!sideOpen} onClick={onSide} />
      </div>
  );
  return (
    <ChartVizCard title={FINDING}>
      <Grow open={chart}>{bar}</Grow>
      {segment ? (
        <p className="dlg-segment">
          Repeat shoppers: <span className="dp-summary__emph">88 of 125</span> read it as this Friday
        </p>
      ) : null}
    </ChartVizCard>
  );
}

function QuoteRow({ q, open, onTap, onClose, playSec }: { q: { participant: string; time: string; quote: string }; open: boolean; onTap?: () => void; onClose?: () => void; playSec?: number }) {
  const start = q.time.split(/[\u2013-]/)[0];
  return (
    <div className={["dp-clip-quote", open ? "dp-clip-quote--selected" : ""].filter(Boolean).join(" ")} data-target={`quote-${q.participant.toLowerCase()}`} onClick={() => { if (!open) onTap?.(); }}>
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-clip-quote__name">{q.participant}</span>
        <span className="dp-clip-quote__time">{q.time}</span>
        <button type="button" className="dlg-clip-collapse" data-target="close" aria-label={`Close ${q.participant}'s clip`} data-shown={open ? "" : undefined} onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
          <ChevronUpIcon />
        </button>
      </p>
      <p className="dp-clip-quote__text">{q.quote}</p>
      <Grow open={open}>
        <div className="dlg-live__clip" style={clipRange(q.time)}>
          <DialogueInterviewPlayer current={playSec !== undefined ? fmt(sec(start) + playSec) : start} />
        </div>
      </Grow>
    </div>
  );
}

function Sample({ open, playing, onPlay, onClose, playSec, rows = QUOTE_LIST }: { open: boolean; playing: boolean; onPlay?: () => void; onClose?: () => void; playSec?: number; rows?: typeof QUOTE_LIST }) {
  return (
    <Grow open={open} className="dlg-stage__item">
      <div className="dp-side-sample dlg-stage__sample">
        <p className="dp-side-sample__head dp-text-body">
          <span className="dlg-sample-key" aria-hidden /><span className="dp-summary__emph">75</span> unsure, {rows.length} shown
          <button type="button" className="dlg-clip-collapse" data-target="side-collapse" data-shown="" aria-label="Collapse the 75 unsure" onClick={() => (window as unknown as { __dlg: { side: (b: boolean) => void } }).__dlg.side(false)}>
            <ChevronUpIcon />
          </button>
        </p>
        <div className="dp-clip-quotes">
          {rows.map((q) => (
            <QuoteRow key={q.participant} q={q} open={playing && q === MEI} onTap={q === MEI ? onPlay : undefined} onClose={onClose} playSec={playSec} />
          ))}
        </div>
        <div className="dp-sources">
          <SourcePill name={`+${75 - rows.length} more`} time="" />
        </div>
      </div>
    </Grow>
  );
}

export default function DialogueMotionStage({ demo }: { demo: MotionDemo }) {
  const startAnswered = demo === "side" || demo === "toggles" || demo === "clip";
  const [typed, setTyped] = useState(demo === "picker" ? QUESTION : "");
  const [sent, setSent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [answered, setAnswered] = useState(startAnswered);
  const [side, setSide] = useState(false);
  const [clip, setClip] = useState(false);
  const [playSec, setPlaySec] = useState(0);
  const [lines, setLines] = useState(0);
  const [mark, setMark] = useState(false);
  const [pick, setPick] = useState(1);
  const [level, setLevel] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const sentences = PARAGRAPH_ANSWER_WALL.flatMap((p, pi) => p.split(/(?<=\.)\s+/).map((t, i) => ({ t, pi, first: i === 0 })));

  useEffect(() => {
    const api = {
      type: (cps = 18) => new Promise<void>((res) => {
        let n = 0;
        const id = setInterval(() => { n++; setTyped(QUESTION.slice(0, n)); if (n >= QUESTION.length) { clearInterval(id); res(); } }, 1000 / cps);
      }),
      send: () => { setSent(true); setTyped(""); },
      analyze: (on: boolean) => setAnalyzing(on),
      answer: () => { setAnalyzing(false); setAnswered(true); },
      side: (on: boolean) => setSide(on),
      clip: (on: boolean) => {
        setClip(on);
        if (tick.current) clearInterval(tick.current);
        setPlaySec(0);
        if (on) tick.current = setInterval(() => setPlaySec((s) => s + 1), 1000);
      },
      line: () => setLines((l) => l + 1),
      mark: () => setMark(true),
      pick: (i: number) => setPick(i),
      // One depth at a time; levels add up (Chart adds the bar, People the quotes, Source the clip). Same level again does nothing.
      level: (i: number) => setLevel((cur) => { if (i === cur) return cur; setSide(i >= 2); api.clip(i >= 3); return i; }),
      follow: (ms = 600) => follow(ms),
      up: (ms = 600) => follow(ms, true),
      pause: () => { if (tick.current) clearInterval(tick.current); },
      deep: () => { setSide(pick >= 2); if (pick >= 3) api.clip(true); },
    };
    (window as unknown as { __dlg: typeof api }).__dlg = api;
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [pick]);

  const bubble = sent || demo === "every" || demo === "before" ? <UserMessageBubble>{QUESTION}</UserMessageBubble> : null;

  let body: ReactNode = null;
  if (demo === "hero") {
    body = (
      <>
        {sent ? <div className="dlg-rise dlg-stage__item">{bubble}</div> : null}
        {analyzing ? (
          <p className="dlg-analyzing dlg-rise dlg-stage__item dlg-stage__analyzing">
            <LoaderArcIcon className="dlg-spin" /> Analyzing interviews
          </p>
        ) : null}
        {answered ? <div className="dlg-rise dlg-fill dlg-stage__item"><AnswerCard segment={false} /></div> : null}
      </>
    );
  } else if (demo === "side") {
    body = (
      <>
        <div className="dlg-stage__item"><AnswerCard sideOpen={side} onSide={() => setSide(true)} /></div>
        <Sample open={side} playing={false} />
      </>
    );
  } else if (demo === "clip") {
    body = (
      <div className="dlg-stage__item dp-clip-quotes dlg-live__sample">
        <QuoteRow q={MEI} open={clip} onTap={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(true)} onClose={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(false)} playSec={playSec} />
      </div>
    );
  } else if (demo === "before") {
    body = (
      <>
        <div className="dlg-stage__item">{bubble}</div>
        <div className="dp-text-prose-sm dlg-before dlg-stage__item">
          {PARAGRAPH_ANSWER_WALL.map((_, pi) => (
            <p key={pi} style={{ margin: 0 }}>
              {sentences.map((s, si) => (s.pi === pi ? (
                <span key={si} className="dlg-line" data-shown={si < lines ? "" : undefined}>
                  {s.t.startsWith("Many found") ? <><span className="dlg-mark" data-on={mark ? "" : undefined}>Many found</span>{s.t.slice(10)}</> : s.t}{" "}
                </span>
              ) : null))}
            </p>
          ))}
        </div>
      </>
    );
  } else if (demo === "every" || demo === "picker") {
    body = (
      <>
        {demo === "every" || sent ? <div className="dlg-stage__item dlg-rise">{bubble}</div> : null}
        <Grow open={answered} className="dlg-stage__item"><AnswerCard /></Grow>
        <Sample open={answered && side} playing={clip} playSec={playSec} />
      </>
    );
  } else if (demo === "toggles") {
    body = (
      <>
        <div className="dlg-stage__item">
          <AnswerCard chart={level >= 1} sideOpen={level >= 2} />
          <div className="dlg-depth dlg-depth--inline" role="group" aria-label="Answer depth">
            {LEVELS.map((l, i) => (
              <button key={l} type="button" className="dlg-depth__opt" aria-pressed={i <= level} aria-current={i === level ? "true" : undefined} data-target={`level-${i}`} onClick={() => (window as unknown as { __dlg: { level: (n: number) => void } }).__dlg.level(i)}>{l}</button>
            ))}
          </div>
        </div>
        <Sample open={level >= 2} playing={level >= 3} playSec={playSec} />
      </>
    );
  }

  const composer = (demo === "hero" || demo === "picker") ? (
    <div className="dp-study-chat__composer">
      {demo === "picker" ? (
        <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
          {LEVELS.map((l, i) => (
            <button key={l} type="button" role="radio" aria-checked={pick === i} data-target={`depth-${i}`} className="dlg-depth__opt" disabled={sent} onClick={() => setPick(i)}>{l}</button>
          ))}
        </div>
      ) : null}
      <div className="dp-study-chat__composer-box">
        {typed ? <p className="dp-study-chat__composer-text">{typed}</p> : <p className="dp-study-chat__composer-placeholder">{dialogueCopy.composerPlaceholder}</p>}
        <span className="dp-study-chat__composer-send dlg-live__send" data-target="send" data-ready={typed ? "" : undefined} aria-hidden>
          {analyzing ? <LoaderArcIcon className="dlg-spin" /> : <ArrowUpIcon />}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <div className={["dp-study-chat dlg-live dlg-stage", `dlg-stage--${demo}`, demo === "hero" ? "" : "dlg-live--bare", dialogueProductFontClassName].filter(Boolean).join(" ")} data-demo={demo}>
      {demo === "hero" ? (
        <div className="dp-study-chat__head">
          <div className="dp-study-chat__head-top">
            <div className="dp-study-chat__head-text">
              <div className="dp-study-chat__title-row">
                <p className="dp-study-chat__title">{dialogueCopy.assistantTitle}</p>
                <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
              </div>
            </div>
            <span className="dp-study-chat__minimize" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </span>
          </div>
        </div>
      ) : null}
      <div className="dlg-stage__body">{body}</div>
      {composer}
    </div>
  );
}
