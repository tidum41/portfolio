"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, ChevronUpIcon, LoaderArcIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { PARAGRAPH_ANSWER_WALL, QUOTE_LIST, QUOTE_LIST_FRIDAY, QUOTE_LIST_NEW } from "@/lib/dialogue/product/sampleData";
import ChartRankList from "@/components/dialogue/product/chart/ChartRankList";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";

/* P15 item 17: thin answer, then follow-up chips the same 300 sessions answer with a real count (Hearthside mock). */
const THIN_QUESTION = "What did lapsed buyers say about their first order?";
const THIN_CHIPS = [
  "What did shoppers ask for after checkout?",
  "How sure were shoppers about the delivery date?",
] as const;
const TOP_ASKS = [
  { rank: 1, label: "Show an exact calendar date", value: 41 },
  { rank: 2, label: "Say which Friday it means", value: 28 },
  { rank: 3, label: "Warn when Friday slips", value: 17 },
] as const;

/* P15 item 3: a case-study callout drawn over the recording, outside the product UI. Points at one element. */
type Note = { text: string; sel: string; place?: "above" | "below" | "right" } | null;
function Callout({ note }: { note: Note }) {
  const [box, setBox] = useState<{ x: number; y: number; place: string } | null>(null);
  const [shown, setShown] = useState<Note>(null);
  useEffect(() => {
    if (!note) { const t = setTimeout(() => { setShown(null); setBox(null); }, 300); return () => clearTimeout(t); }
    const frame = document.getElementById("frame");
    const el = document.querySelector<HTMLElement>(note.sel);
    if (!frame || !el) return;
    const zoom = Number(getComputedStyle(frame).zoom) || 1;
    const f = frame.getBoundingClientRect(), r = el.getBoundingClientRect();
    const place = note.place ?? "above";
    const x = place === "right" ? r.right : r.left + r.width / 2;
    const y = place === "right" ? r.top + r.height / 2 : place === "below" ? r.bottom : r.top;
    const id = requestAnimationFrame(() => { setBox({ x: (x - f.left) / zoom, y: (y - f.top) / zoom, place }); setShown(note); });
    return () => cancelAnimationFrame(id);
  }, [note]);
  if (!shown || !box) return null;
  return (
    <div className="dlg-callout" data-place={box.place} data-on={note ? "" : undefined} style={{ ["--x" as string]: `${box.x}px`, ["--y" as string]: `${box.y}px` } as CSSProperties} aria-hidden>
      <span className="dlg-callout__text">{shown.text}</span>
    </div>
  );
}

type SideWhich = "friday" | "unsure" | false;
type SampleWhich = "friday" | "unsure" | "new";

/*
 * P11 motion stage: one storyboard per case-study video (build/p11-motion-spec.md, design/TASTE.md "Motion").
 * The recorder (scripts/record-dialogue-motion.mjs) drives it through window.__dlg; the page never
 * scrolls itself. New content grows below the tapped element (400 ms, cubic-bezier(0.2, 0, 0, 1)),
 * entrances fade and rise 8 px (350 ms), nothing pops. Hearthside mock data, same as the page.
 */
export type MotionDemo = "hero" | "side" | "clip" | "before" | "every" | "picker" | "toggles" | "bars" | "thin";

const SAMPLE_META: Record<SampleWhich, { rows: typeof QUOTE_LIST; count: number; of: number; label: string }> = {
  friday: { rows: QUOTE_LIST_FRIDAY, count: 225, of: 300, label: "read it as this Friday" },
  unsure: { rows: QUOTE_LIST, count: 75, of: 300, label: "unsure" },
  new: { rows: QUOTE_LIST_NEW, count: 9, of: 14, label: "new shoppers" },
};

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
/** P14 item 5: while content grows above a pinned chip/control, keep its y steady by absorbing scrollHeight growth into scrollTop. Never call follow() during the grow. */
function pinDuringGrow(ms = 400) {
  const body = document.querySelector<HTMLElement>(".dlg-stage__body");
  if (!body) return;
  let lastH = body.scrollHeight;
  const t0 = performance.now();
  const step = (now: number) => {
    const h = body.scrollHeight;
    const growth = h - lastH;
    if (growth > 0) body.scrollTop += growth;
    lastH = h;
    if (now - t0 < ms) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
function clipRange(time: string): CSSProperties {
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const total = sec("42:10");
  return { ["--clip-a" as string]: `${(a / total) * 100}%`, ["--clip-w" as string]: `${((z - a) / total) * 100}%` } as CSSProperties;
}

function AnswerCard({ segment = false, onSide, sideOpen = false, chart = true }: { segment?: boolean; onSide?: (w: "friday" | "unsure") => void; sideOpen?: SideWhich; chart?: boolean }) {
  const bar = (
      <div className="dlg-live__bar" data-side={sideOpen || undefined}>
        <ChartStackedBar
          total={300}
          segments={[
            { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
            { label: "Unsure", value: 75, display: "75 of 300" },
          ]}
        />
        {/* P14 items 1+7: both segments tappable; focal segment carries data-target for the recorder. */}
        <button type="button" className="dlg-live__side dlg-live__side--friday" data-target="side-friday" aria-label="Open the 225 this Friday" aria-expanded={sideOpen === "friday"} onClick={() => onSide?.("friday")} />
        <button type="button" className="dlg-live__side dlg-live__side--unsure" data-target="side" aria-label="Open the 75 unsure" aria-expanded={sideOpen === "unsure"} onClick={() => onSide?.("unsure")} />
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

/** P14 item 2: quote rows are a selection, not a nested accordion. Tap opens (one at a time); tap again closes. No inner chevron. */
function QuoteRow({ q, open, onTap, playSec }: { q: { participant: string; time: string; quote: string }; open: boolean; onTap?: () => void; playSec?: number }) {
  const start = q.time.split(/[\u2013-]/)[0];
  return (
    <div
      className={["dp-clip-quote", open ? "dp-clip-quote--selected" : ""].filter(Boolean).join(" ")}
      data-target={`quote-${q.participant.toLowerCase()}`}
      role="button"
      tabIndex={0}
      aria-pressed={open}
      aria-label={open ? `Close ${q.participant}'s clip` : `Open ${q.participant}'s clip`}
      onClick={() => onTap?.()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap?.(); } }}
    >
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-clip-quote__name">{q.participant}</span>
        <span className="dp-clip-quote__time">{q.time}</span>
        <span className="dp-clips-link dlg-view-session" data-target={`session-${q.participant.toLowerCase()}`}>View session</span>
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

function Sample({ open, which = "unsure", playing, onPlay, playSec, onCollapse }: { open: boolean; which?: SampleWhich; playing: boolean; onPlay?: () => void; playSec?: number; onCollapse?: () => void }) {
  const meta = SAMPLE_META[which];
  const rows = meta.rows;
  const more = meta.count - rows.length;
  const lead = rows[0];
  const collapse = onCollapse ?? (() => (window as unknown as { __dlg: { side: (b: SideWhich) => void } }).__dlg.side(false));
  return (
    <Grow open={open} className="dlg-stage__item">
      <div className="dp-side-sample dlg-stage__sample" data-side={which}>
        <p className="dp-side-sample__head dp-text-body">
          <span className="dlg-sample-key" aria-hidden /><span className="dp-summary__emph">{meta.count}</span> {meta.label}, {rows.length} shown
          <button type="button" className="dlg-clip-collapse" data-target="side-collapse" data-shown="" aria-label={`Collapse the ${meta.count} ${meta.label}`} onClick={collapse}>
            <ChevronUpIcon />
          </button>
        </p>
        <div className="dp-clip-quotes">
          {rows.map((q) => (
            <QuoteRow key={q.participant} q={q} open={playing && q === (which === "unsure" ? MEI : lead)} onTap={which === "unsure" && q === MEI ? onPlay : undefined} playSec={playSec} />
          ))}
        </div>
        <div className="dp-sources">
          <SourcePill name={`+${more} more`} time="" />
        </div>
      </div>
    </Grow>
  );
}

/** P14 item 9: segment bars; tap New shoppers to open its people (counts interaction on a chart). */
function BarsCard({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <ChartVizCard title="Read Friday as this Friday, by shopper type">
      <div className="dlg-live__bars">
        <ChartBarList
          rows={[
            { label: "New shoppers", value: 9 / 14, display: "9 of 14", focal: true },
            { label: "Repeat shoppers", value: 88 / 125, display: "88 of 125" },
          ]}
          max={1}
        />
        <button
          type="button"
          className="dlg-live__bar-hit"
          data-target="bar-new"
          aria-label="Open the 9 new shoppers"
          aria-expanded={open}
          onClick={onOpen}
        />
      </div>
    </ChartVizCard>
  );
}

export default function DialogueMotionStage({ demo }: { demo: MotionDemo }) {
  // P15 item 4: every starts answered and folds back to it, so the UI never fades out of the loop.
  const startAnswered = demo === "side" || demo === "toggles" || demo === "clip" || demo === "bars" || demo === "every" || demo === "thin";
  const [typed, setTyped] = useState(demo === "picker" ? QUESTION : "");
  const [sent, setSent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [answered, setAnswered] = useState(startAnswered);
  const [side, setSide] = useState<SideWhich>(false);
  const [barOpen, setBarOpen] = useState(false);
  const [clip, setClip] = useState(false);
  const [playSec, setPlaySec] = useState(0);
  const [lines, setLines] = useState(0);
  const [mark, setMark] = useState(false);
  // P14 item 5: picker defaults to Insight (0), matching the decided default answer (count + insight).
  const [pick, setPick] = useState(0);
  const [level, setLevel] = useState(0);
  const [note, setNote] = useState<Note>(null);
  const [thinAsk, setThinAsk] = useState(false);
  const [thinAnalyzing, setThinAnalyzing] = useState(false);
  const [thinAnswer, setThinAnswer] = useState(false);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  useEffect(() => { const id = requestAnimationFrame(() => setFrameEl(document.getElementById("frame"))); return () => cancelAnimationFrame(id); }, []);
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
      // P14 items 1+7: side("friday" | "unsure" | false). true keeps the old "unsure" meaning for toggles/deep.
      side: (on: SideWhich | boolean) => {
        const next: SideWhich = on === true ? "unsure" : on === false ? false : on;
        setSide(next);
        if (next) pinDuringGrow(400);
      },
      clip: (on: boolean) => {
        setClip(on);
        if (tick.current) clearInterval(tick.current);
        setPlaySec(0);
        if (on) tick.current = setInterval(() => setPlaySec((s) => s + 1), 1000);
      },
      line: () => setLines((l) => l + 1),
      mark: () => setMark(true),
      pick: (i: number) => setPick(i),
      // One depth at a time; levels add up. Pin the chip row while content grows above it (P14 item 5).
      level: (i: number) => {
        setLevel((cur) => {
          if (i === cur) return cur;
          setSide(i >= 2 ? "unsure" : false);
          api.clip(i >= 3);
          pinDuringGrow(400);
          return i;
        });
      },
      note: (text: string, sel: string, place?: "above" | "below" | "right") => setNote({ text, sel, place }),
      unnote: () => setNote(null),
      // P15 item 17: tap a follow-up chip; it becomes the next question and its answer fills in below.
      ask: () => { setThinAsk(true); setThinAnalyzing(true); },
      reply: () => { setThinAnalyzing(false); setThinAnswer(true); },
      follow: (ms = 600) => follow(ms),
      up: (ms = 600) => follow(ms, true),
      pause: () => { if (tick.current) clearInterval(tick.current); },
      // Picker: pin the answer top in view so the 4.7s poster still shows the count (not only the clip).
      deep: () => {
        setSide(pick >= 2 ? "unsure" : false);
        if (pick >= 3) api.clip(true);
        const body = document.querySelector<HTMLElement>(".dlg-stage__body");
        const ans = body?.querySelector<HTMLElement>(".dlg-grow, .dlg-fill, .dlg-stage__item");
        if (body && ans) {
          requestAnimationFrame(() => { body.scrollTop = Math.max(0, ans.offsetTop); });
        }
      },
      // P14 item 9: open/close the New shoppers sample under the bar chart.
      bar: (on: boolean) => { setBarOpen(on); if (on) pinDuringGrow(400); },
      // P14 item 6: collapse picker back to the start state so the loop does not crossfade two composers.
      reset: () => {
        if (tick.current) clearInterval(tick.current);
        setSent(false);
        setAnalyzing(false);
        setAnswered(false);
        setSide(false);
        setBarOpen(false);
        setClip(false);
        setPlaySec(0);
        setPick(0);
        setLevel(0);
        setNote(null);
        setThinAsk(false);
        setThinAnalyzing(false);
        setThinAnswer(false);
        setTyped(QUESTION);
      },
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
        <div className="dlg-stage__item"><AnswerCard sideOpen={side} onSide={(w) => setSide(w)} /></div>
        <Sample open={!!side} which={side || "unsure"} playing={false} />
      </>
    );
  } else if (demo === "clip") {
    body = (
      <div className="dlg-stage__item dp-clip-quotes dlg-live__sample">
        <QuoteRow
          q={MEI}
          open={clip}
          onTap={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(!clip)}
          playSec={playSec}
        />
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
    // P14 item 1 (Mudit): every is cursor-driven on both sides, same as counts-open. Picker still opens via deep().
    body = (
      <>
        {demo === "every" || sent ? <div className="dlg-stage__item dlg-rise">{bubble}</div> : null}
        <Grow open={answered} className="dlg-stage__item">
          <AnswerCard sideOpen={side} onSide={(w) => setSide(w)} />
        </Grow>
        <Sample open={!!side} which={side || "unsure"} playing={clip} playSec={playSec} />
      </>
    );
  } else if (demo === "thin") {
    body = (
      <>
        <div className="dlg-stage__item"><UserMessageBubble>{THIN_QUESTION}</UserMessageBubble></div>
        <div className="dlg-stage__item dlg-thin">
          <p className="dp-summary dp-text-body">Two of 63 lapsed buyers mentioned that their first order arrived damaged.</p>
          <div className="dp-low-signal" data-target="thin-flag">
            <InfoCircleIcon className="dp-low-signal__icon" />
            <p className="dp-low-signal__text">Early signal, 2 people</p>
          </div>
          <p className="dp-clips-link">View 2 clips</p>
          <div className="dp-followups dlg-thin__chips" data-target="thin-chips">
            {THIN_CHIPS.map((c, i) => (
              <button key={c} type="button" className="dp-followup-btn dlg-chip" data-target={`chip-${i}`} aria-pressed={thinAsk && i === 0} onClick={() => (window as unknown as { __dlg: { ask: () => void } }).__dlg.ask()}>{c}</button>
            ))}
          </div>
        </div>
        {thinAsk ? <div className="dlg-stage__item dlg-rise"><UserMessageBubble>{THIN_CHIPS[0]}</UserMessageBubble></div> : null}
        {thinAnalyzing ? (
          <p className="dlg-analyzing dlg-rise dlg-stage__item dlg-stage__analyzing">
            <LoaderArcIcon className="dlg-spin" /> Analyzing interviews
          </p>
        ) : null}
        {thinAnswer ? (
          <div className="dlg-stage__item dlg-rise" data-target="thin-answer">
            <ChartVizCard title="41 shoppers asked for an exact calendar date after checkout, the most of any ask.">
              <ChartRankList rows={[...TOP_ASKS]} />
            </ChartVizCard>
          </div>
        ) : null}
      </>
    );
  } else if (demo === "toggles") {
    body = (
      <>
        <div className="dlg-stage__item">
          <AnswerCard chart={level >= 1} sideOpen={level >= 2 ? "unsure" : false} />
          <div className="dlg-depth dlg-depth--inline" role="group" aria-label="Answer depth">
            {LEVELS.map((l, i) => (
              <button key={l} type="button" className="dlg-depth__opt" aria-pressed={i <= level} aria-current={i === level ? "true" : undefined} data-target={`level-${i}`} onClick={() => (window as unknown as { __dlg: { level: (n: number) => void } }).__dlg.level(i)}>{l}</button>
            ))}
          </div>
        </div>
        <Sample open={level >= 2} which="unsure" playing={level >= 3} playSec={playSec} />
      </>
    );
  } else if (demo === "bars") {
    body = (
      <>
        <div className="dlg-stage__item">
          <BarsCard open={barOpen} onOpen={() => setBarOpen(true)} />
        </div>
        <Sample open={barOpen} which="new" playing={false} onCollapse={() => setBarOpen(false)} />
      </>
    );
  }

  const composer = (demo === "hero" || demo === "picker") ? (
    <div className="dp-study-chat__composer">
      {demo === "picker" ? (
        <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
          {LEVELS.map((l, i) => (
            /* P14 item 6: cumulative highlight like toggles (levels add up). No X / clear affordance. */
            <button key={l} type="button" role="radio" aria-checked={pick === i} aria-pressed={i <= pick} aria-current={i === pick ? "true" : undefined} data-target={`depth-${i}`} className="dlg-depth__opt" disabled={sent} onClick={() => setPick(i)}>{l}</button>
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
      {frameEl ? createPortal(<Callout note={note} />, frameEl) : null}
    </div>
  );
}
