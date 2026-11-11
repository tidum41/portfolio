"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { AnswerCard, type SideWhich } from "@/components/dialogue/live/AnswerCard";
import { Grow, K } from "@/components/dialogue/live/Grow";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, ChevronUpIcon, LoaderArcIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { THIN_FLAG, THIN_TIP } from "@/lib/dialogue/product/thinCopy";
import { PARAGRAPH_ANSWER_WALL, QUOTE_LIST, QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";
import type { MotionDemo } from "@/components/dialogue/motion/stages";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";

/* P16: the thin answer stays on the page's one question, "Arrives by Friday". Two shoppers is too thin for a chart; the
   tapped chip counts repeat shoppers from the same 300 interviews (88 of 125, the segment line the answer card already uses). */
const THIN_QUESTION = "Did anyone miss a delivery over \u2018Arrives by Friday\u2019?";
const THIN_FINDING = "Two of 300 shoppers said they missed a delivery.";
const THIN_CHIPS = [
  "How did repeat shoppers read it?",
  "What did shoppers say about the date?",
] as const;
const THIN_REPEAT = { friday: 88, other: 37, of: 125 } as const;

/* P16 round 3: a static case-study annotation in the well's right gutter. Its leader starts in the panel's empty
   right padding, exactly level with what it names (no clamp), and runs to small muted text. It fades in once when its
   mark lands and then stays put to the end of the take; it rides along if the chat scrolls. Phone takes have none. */
type Note = { text: string; sel: string } | null;
function Annotation({ note }: { note: Note }) {
  const [shown, setShown] = useState<{ text: string; y: number } | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!note) { const id = requestAnimationFrame(() => { setOn(false); setShown(null); }); return () => cancelAnimationFrame(id); }
    const frame = document.getElementById("frame");
    if (!frame || frame.hasAttribute("data-mobile")) return;
    let id = 0;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(note.sel);
      if (el) {
        const f = frame.getBoundingClientRect(), r = el.getBoundingClientRect();
        // The recorder zooms the frame 2x; client rects are zoomed, the note's offset is not.
        const k = f.height / (frame.offsetHeight || f.height);
        const y = (r.top + r.height / 2 - f.top) / k;
        setShown((cur) => (cur && Math.abs(cur.y - y) < 0.25 && cur.text === note.text ? cur : { text: note.text, y }));
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => { cancelAnimationFrame(id); cancelAnimationFrame(t); };
  }, [note]);
  if (!shown) return null;
  return (
    <div className="dlg-note" data-on={on ? "" : undefined} style={{ ["--y" as string]: `${shown.y}px` } as CSSProperties} aria-hidden>
      <span className="dlg-note__line" />
      <span className="dlg-note__text">{shown.text}</span>
    </div>
  );
}

type SampleWhich = "friday" | "unsure";

/*
 * P11 motion stage: one storyboard per case-study video (build/p11-motion-spec.md, design/TASTE.md "Motion").
 * The recorder (scripts/record-dialogue-motion.mjs) drives it through window.__dlg; the page never
 * scrolls itself. New content grows below the tapped element (400 ms, cubic-bezier(0.2, 0, 0, 1)),
 * entrances fade and rise 8 px (350 ms), nothing pops. Hearthside mock data, same as the page.
 */
export type { MotionDemo } from "@/components/dialogue/motion/stages";

const SAMPLE_META: Record<SampleWhich, { rows: typeof QUOTE_LIST; count: number; of: number; label: string; who: string }> = {
  friday: { rows: QUOTE_LIST_FRIDAY, count: 225, of: 300, label: "read it as this Friday", who: "who read it as this Friday" },
  unsure: { rows: QUOTE_LIST, count: 75, of: 300, label: "unsure", who: "who were unsure" },
};

const QUESTION = "How do shoppers read \u2018Arrives by Friday\u2019?";
const LEVELS = ["Insight", "Chart", "People"] as const;
const MEI = QUOTE_LIST[0];

/* Keep the newest content in view: ease the panel body's scroll (600 ms ease-in-out), never a snap. */
/* cubic-bezier(0.4, 0, 0.2, 1), sampled */
const ease = (p: number) => { let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; const x = 3 * 0.4 * m * (1 - m) ** 2 + 3 * 0.2 * m * m * (1 - m) + m ** 3; if (x < p) lo = m; else hi = m; } const m = (lo + hi) / 2; return 3 * m * m * (1 - m) + m ** 3; };
function follow(ms = 500, up = false) {
  ms *= K();
  const body = document.querySelector<HTMLElement>(".dlg-stage__body");
  if (!body) return;
  const from = body.scrollTop, to = up ? 0 : body.scrollHeight - body.clientHeight;
  if (Math.abs(to - from) <= 1) return;
  const t0 = performance.now();
  const step = () => { const now = performance.now(); const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
/** P14 item 5: while content grows above a pinned chip/control, keep its y steady by absorbing scrollHeight growth into scrollTop. Never call follow() during the grow. */
function pinDuringGrow(ms = 400) {
  ms *= K();
  const body = document.querySelector<HTMLElement>(".dlg-stage__body");
  if (!body) return;
  let lastH = body.scrollHeight;
  const t0 = performance.now();
  const step = () => { const now = performance.now();
    const h = body.scrollHeight;
    const growth = h - lastH;
    if (growth > 0) body.scrollTop += growth;
    lastH = h;
    if (now - t0 < ms) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** The recorder renders the stage with CSS zoom, where rects are in zoomed px and scrollTop is not; this is the factor between them. */
const zoomOf = (el: HTMLElement) => (el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1) || 1;
const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
/* P16 round 3: each participant's session has its own length (mock), and its own illustrated still. */

/** P14 item 2: quote rows are a selection, not a nested accordion. Tap opens (one at a time); tap again closes. No inner chevron. */
// Mock: repeat shoppers (125) and everyone asked about the delivery date (300), from the same 300 interviews.
const THIN_CHIP_N = [125, 300] as const;
function PlayGlyph() {
  return <svg className="dlg-play-clip__icon" viewBox="0 0 16 16" aria-hidden><path d="M5 3.5v9l7-4.5z" fill="currentColor" /></svg>;
}
function PlusGlyph() {
  return <svg className="dlg-thin__chip-plus" viewBox="0 0 24 24" aria-hidden><path d="M5 12h14M12 5v14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
const clipLen = (time: string) => { const [a, z] = time.split(/[\u2013-]/).map(sec); return fmt(z - a); };

export function QuoteRow({ q, open, onTap, playSec }: { q: { participant: string; time: string; quote: string }; open: boolean; onTap?: () => void; playSec?: number }) {
  const [start, end] = q.time.split(/[\u2013-]/);
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
        {/* Round 18: every row carries its clip length in one fixed right lane, drawn as a play chip. Tapping the row plays it; a second tap pauses it. */}
        <span className="dlg-dur" data-play={!open ? "" : undefined} data-open={open ? "" : undefined}>
          <PlayGlyph />
          {clipLen(q.time)}
        </span>
      </p>
      <p className="dp-clip-quote__text">{q.quote}</p>
      <Grow open={open} closeMs={560}>
        <div className="dlg-live__clip" data-who={q.participant.toLowerCase()}>
          <DialogueInterviewPlayer start={start} current={playSec !== undefined ? fmt(Math.min(sec(end), sec(start) + playSec)) : start} total={end} />
        </div>
      </Grow>
    </div>
  );
}

function SampleHead({ meta, shown, onCollapse }: { meta: (typeof SAMPLE_META)[SampleWhich]; shown: number; onCollapse: () => void }) {
  return (
    <p className="dp-side-sample__head dp-text-body">
      <span className="dlg-sample-key" aria-hidden />
      <span className="dlg-sample-head__text"><span className="dp-summary__emph">{shown}</span> <span className="dlg-nowrap">{shown === 1 ? "quote shown," : "quotes shown,"}</span> <span className="dlg-nowrap">picked from the {meta.count}</span> <span className="dlg-nowrap">{meta.who}</span></span>
      <button type="button" className="dlg-clip-collapse" data-target="side-collapse" data-shown="" aria-label={`Collapse the ${meta.count} ${meta.label}`} onClick={onCollapse}>
        <ChevronUpIcon />
      </button>
    </p>
  );
}

/* Round 19 (Mudit picked option C): a header names the open segment with its swatch, a row of source pills holds the
   timestamps (the selected one shares the quote card's warm fill), and the quote uses the full panel width. Every part is
   an existing Dialogue element, and there is no coloured edge on the quote. */
const FRIDAY = SAMPLE_META.friday;
const TAIL = FRIDAY.count - QUOTE_LIST_FRIDAY.length;
export function HeroSelection() {
  const [ana, dev] = QUOTE_LIST_FRIDAY;
  const startOf = (t: string) => t.split(/[\u2013-]/)[0];
  return (
    <div className="dp-side-sample dlg-stage__sample" data-side="friday" data-hero="">
      <p className="dlg-hero-head" aria-hidden>
        <span className="dlg-sample-key" />
        <span>{FRIDAY.label.replace(/^./, (c) => c.toUpperCase())}</span>
        <span className="dlg-hero-head__count">{FRIDAY.count}</span>
      </p>
      <div className="dp-sources" aria-hidden>
        <SourcePill name={ana.participant} time={startOf(ana.time)} selected />
        <SourcePill name={dev.participant} time={startOf(dev.time)} />
        <SourcePill name={`+${TAIL} more`} time="" />
      </div>
      <div className="dp-clip-quotes"><QuoteRow q={ana} open={false} /></div>
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
        <SampleHead meta={meta} shown={rows.length} onCollapse={collapse} />
        <div className="dp-clip-quotes">
          {rows.map((q) => (
            <QuoteRow key={q.participant} q={q} open={playing && q === lead} onTap={q === lead ? onPlay : undefined} playSec={playSec} />
          ))}
        </div>
        <div className="dp-sources">
          <SourcePill name={`+${more} more`} time="" />
        </div>
      </div>
    </Grow>
  );
}

export default function DialogueMotionStage({ demo }: { demo: MotionDemo }) {
  // P15 item 4: every starts answered and folds back to it, so the UI never fades out of the loop.
  // P16: add-only takes (hero, before, thin) start on an empty chat and end by scrolling their conversation up and out,
  // so the loop never fades the UI. Clip opens from the counts end state: 225 open, Ana first.
  const startAnswered = demo === "side" || demo === "toggles" || demo === "clip" || demo === "every";
  const [typed, setTyped] = useState("");
  const [sent, setSent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [answered, setAnswered] = useState(startAnswered);
  const [side, setSide] = useState<SideWhich>(demo === "side" || demo === "clip" ? "friday" : false);
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
  const [ana, setAna] = useState(false);
  const [thinShown, setThinShown] = useState(false);
  const [clearH, setClearH] = useState(0);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  useEffect(() => { const id = requestAnimationFrame(() => setFrameEl(document.getElementById("frame"))); return () => cancelAnimationFrame(id); }, []);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const sentences = PARAGRAPH_ANSWER_WALL.flatMap((p, pi) => p.split(/(?<=\.)\s+/).map((t, i) => ({ t, pi, first: i === 0 })));

  useEffect(() => {
    const api = {
      type: (cps = 18) => new Promise<void>((res) => {
        let n = 0;
        const id = setInterval(() => { n++; setTyped(QUESTION.slice(0, n)); if (n >= QUESTION.length) { clearInterval(id); res(); } }, (1000 / cps) * K());
      }),
      send: () => { setSent(true); setTyped(""); },
      analyze: (on: boolean) => setAnalyzing(on),
      answer: () => { setAnalyzing(false); setAnswered(true); },
      // P14 items 1+7: side("friday" | "unsure" | false). true keeps the old "unsure" meaning for toggles/deep.
      side: (on: SideWhich | boolean) => {
        const next: SideWhich = on === true ? "unsure" : on === false ? false : on;
        setSide(next);
        // Only the first try pins the bar while its people grow, which pushes the count up and out of view (its point).
        // Counts and clip grow below a still bar.
        // P16: nothing pins; a later reveal() scrolls only when the next thing would be out of view.
      },
      clip: (on: boolean) => {
        setClip(on);
        if (tick.current) clearInterval(tick.current);
        setPlaySec(0);
        if (on) tick.current = setInterval(() => setPlaySec((s) => s + 1), 1000 * K());
      },
      line: () => setLines((l) => l + 1),
      mark: () => setMark(true),
      pick: (i: number) => setPick(i),
      // One depth at a time; levels add up. Pin the chip row while content grows above it (P14 item 5).
      level: (i: number) => {
        setLevel((cur) => {
          if (i === cur) return cur;
          // P16 round 4: People opens the same 225 the bar emphasises, so the segment never switches.
          setSide(i >= 2 ? "friday" : false);
          // Ana's clip opens only when her row is tapped; leaving People closes it.
          if (i < 2) api.clip(false);
          pinDuringGrow(400);
          return i;
        });
      },
      note: (text: string, sel: string) => setNote({ text, sel }),
      unnote: () => setNote(null),
      // P15 item 17: tap a follow-up chip; it becomes the next question and its answer fills in below.
      ask: () => { setThinAsk(true); setThinAnalyzing(true); },
      reply: () => { setThinAnalyzing(false); setThinAnswer(true); },
      follow: (ms = 600) => follow(ms),
      // P16 round 3: while a player grows, ease the chat toward its end every frame, so no still frame holds a
      // half-revealed row across the card's bottom edge.
      // P16 round 3: ease an element's top to `pad` px below the body's top edge (the toggles keep their chips in view).
      top: (sel: string, pad = 8, ms = 700) => {
        ms *= K();
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); const el = document.querySelector<HTMLElement>(sel);
        if (!body || !el) return;
        const from = body.scrollTop, to = Math.max(0, from + (el.getBoundingClientRect().top - body.getBoundingClientRect().top) / zoomOf(body) - pad), t0 = performance.now();
        const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
        const step = () => { const now = performance.now(); const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      },
      // While content grows below, keep the bottom of the chat (or, with `sel`, that element at `pad` px under the top)
      // in view every frame, so the scroll and the grow are one motion and nothing lands in a second step.
      stick: (ms = 560, sel?: string, pad = 8) => {
        ms *= K();
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); if (!body) return;
        const t0 = performance.now();
        const step = () => { const now = performance.now();
          const max = body.scrollHeight - body.clientHeight;
          let want = max;
          const el = sel ? document.querySelector<HTMLElement>(sel) : null;
          if (el) want = Math.min(max, Math.max(0, body.scrollTop + (el.getBoundingClientRect().top - body.getBoundingClientRect().top) / zoomOf(body) - pad));
          if (want > body.scrollTop) body.scrollTop = want;
          if (now - t0 < ms) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      // Keep an element's bottom `pad` px above the body's bottom edge while content grows (scrolls down only), so a row
      // below it waits just outside the held frame.
      stickEnd: (ms = 560, sel = "", pad = 8) => {
        ms *= K();
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); if (!body) return;
        const t0 = performance.now();
        const step = () => { const now = performance.now();
          const el = document.querySelector<HTMLElement>(sel);
          if (el) {
            const want = Math.min(body.scrollHeight - body.clientHeight, body.scrollTop + (el.getBoundingClientRect().bottom - body.getBoundingClientRect().bottom) / zoomOf(body) + pad);
            if (want > body.scrollTop) body.scrollTop = want;
          }
          if (now - t0 < ms) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      chase: (ms = 1300, rate = 0.07) => {
        ms *= K(); rate /= K();
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); if (!body) return;
        const t0 = performance.now();
        const step = () => { const now = performance.now();
          const max = body.scrollHeight - body.clientHeight, left = max - body.scrollTop;
          body.scrollTop += Math.sign(left) * Math.min(Math.abs(left), Math.max(0.6, Math.abs(left) * rate));
          if (now - t0 < ms) requestAnimationFrame(step); else body.scrollTop = body.scrollHeight - body.clientHeight;
        };
        requestAnimationFrame(step);
      },
      // P16 hero: Ana's row lands under the count, the one quote the page follows from here on.
      ana: () => setAna(true),
      // P16 thin: the question and its thin answer arrive together.
      thin: () => { setSent(true); setThinShown(true); },
      // P16: scroll just enough that an element's bottom sits `pad` px above the panel body's bottom edge.
      reveal: (sel: string, pad = 16, ms = 600) => {
        ms *= K();
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); const el = document.querySelector<HTMLElement>(sel);
        if (!body || !el) return;
        const b = body.getBoundingClientRect(), r = el.getBoundingClientRect();
        const to = Math.max(0, Math.min(body.scrollHeight - body.clientHeight, body.scrollTop + (r.bottom - b.bottom) / zoomOf(body) + pad));
        const from = body.scrollTop, t0 = performance.now();
        if (ms <= 0) { body.scrollTop = to; return; }
        const step = () => { const now = performance.now(); const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      },
      // P16 loop seam for add-only takes: a spacer one body tall lands under the chat and the body eases to it, so the
      // conversation scrolls up and out like a new chat. The panel, its header and composer never leave the card.
      clear: (ms = 700) => {
        const body = document.querySelector<HTMLElement>(".dlg-stage__body");
        if (!body) return;
        setClearH(body.clientHeight);
        requestAnimationFrame(() => requestAnimationFrame(() => follow(ms)));
      },
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
      // P14 item 6: collapse picker back to the start state so the loop does not crossfade two composers.
      reset: () => {
        if (tick.current) clearInterval(tick.current);
        setSent(false);
        setAnalyzing(false);
        setAnswered(false);
        setSide(false);
        setClip(false);
        setPlaySec(0);
        setPick(0);
        setLevel(0);
        setNote(null);
        setThinAsk(false);
        setThinAnalyzing(false);
        setThinAnswer(false);
        setTyped("");
      },
    };
    (window as unknown as { __dlg: typeof api }).__dlg = api;
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [pick, demo]);

  const bubble = sent ? <UserMessageBubble>{QUESTION}</UserMessageBubble> : null;

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
        {answered ? <div className="dlg-rise dlg-fill dlg-stage__item"><AnswerCard segment={false} sideOpen={ana ? "friday" : false} /></div> : null}
        <Grow open={ana} className="dlg-stage__item">
          <HeroSelection />
        </Grow>
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
      <>
        <div className="dlg-stage__item"><AnswerCard sideOpen="friday" /></div>
        <Sample open which="friday" playing={clip} playSec={playSec} onPlay={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(!clip)} />
      </>
    );
  } else if (demo === "before") {
    body = (
      <>
        {bubble ? <div className="dlg-stage__item dlg-rise">{bubble}</div> : null}
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
        {demo === "every" ? null : <Grow open={sent} className="dlg-stage__item"><div className="dlg-stage__item"><UserMessageBubble>{QUESTION}</UserMessageBubble></div></Grow>}
        <Grow open={answered} className="dlg-stage__item">
          <AnswerCard chart={demo === "picker" ? pick >= 1 : true} sideOpen={side} onSide={(w) => setSide(w)} />
        </Grow>
        <Sample open={!!side} which={side || "unsure"} playing={clip} playSec={playSec} onPlay={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(!clip)} />
      </>
    );
  } else if (demo === "thin") {
    body = (
      <>
        {thinShown ? <div className="dlg-stage__item dlg-rise"><UserMessageBubble>{THIN_QUESTION}</UserMessageBubble></div> : null}
        {thinShown ? <div className="dlg-stage__item dlg-thin dlg-rise">
          <p className="dp-summary dp-text-body">{THIN_FINDING}</p>
          {/* P16: the flag says why there is no chart (the 3-person cutoff the page states). */}
          <div className="dp-low-signal" data-target="thin-flag">
            <span className="dlg-info" tabIndex={0} aria-describedby="dlg-thin-tip" data-target="thin-info">
              <InfoCircleIcon className="dp-low-signal__icon" />
              <span id="dlg-thin-tip" role="tooltip" className="dp-hero-tooltip dlg-info__tip">{THIN_TIP}</span>
            </span>
            <p className="dp-low-signal__text">{THIN_FLAG}</p>
          </div>
          <p className="dp-clips-link">View 2 clips</p>
          {/* P16: the chips say what they are, follow-ups the same interviews can answer with a count. */}
          {/* P16 round 4: the label says what the chips are for; each chip shows how many answers it would count. */}
          <p className="dlg-thin__label">Follow-ups with more data</p>
          <div className="dlg-thin__chips" data-target="thin-chips">
            {THIN_CHIPS.map((c, i) => (
              <button key={c} type="button" className="dlg-suggest dlg-thin__chip" data-target={`chip-${i}`} aria-pressed={thinAsk && i === 0} aria-label={`${c} ${THIN_CHIP_N[i]} answers`} onClick={() => (window as unknown as { __dlg: { ask: () => void } }).__dlg.ask()}>
                <PlusGlyph />
                <span className="dlg-thin__chip-q">{c}</span>
                <span className="dlg-thin__chip-n" aria-hidden>{THIN_CHIP_N[i]}</span>
              </button>
            ))}
          </div>
        </div> : null}
        {thinAsk ? <div className="dlg-stage__item dlg-rise"><UserMessageBubble>{THIN_CHIPS[0]}</UserMessageBubble></div> : null}
        {thinAnalyzing ? (
          <p className="dlg-analyzing dlg-rise dlg-stage__item dlg-stage__analyzing">
            <LoaderArcIcon className="dlg-spin" /> Analyzing interviews
          </p>
        ) : null}
        {thinAnswer ? (
          <div className="dlg-stage__item dlg-rise" data-target="thin-answer">
            <ChartVizCard title={`${THIN_REPEAT.friday} of ${THIN_REPEAT.of} repeat shoppers read \u2018Arrives by Friday\u2019 as this Friday.`}>
              <ChartStackedBar lanes
                total={THIN_REPEAT.of}
                segments={[
                  { label: "Read it as this Friday", value: THIN_REPEAT.friday, display: `${THIN_REPEAT.friday} of ${THIN_REPEAT.of}`, focal: true },
                  { label: "Other", value: THIN_REPEAT.other, display: `${THIN_REPEAT.other} of ${THIN_REPEAT.of}` },
                ]}
              />
            </ChartVizCard>
          </div>
        ) : null}
      </>
    );
  } else if (demo === "toggles") {
    body = (
      <>
        <div className="dlg-stage__item">
          <AnswerCard chart={level >= 1} sideOpen={level >= 2 ? "friday" : false} />
          <div className="dlg-depth dlg-depth--inline" role="group" aria-label="Answer depth">
            {LEVELS.map((l, i) => (
              <button key={l} type="button" className="dlg-depth__opt" aria-pressed={i === level} aria-current={i === level ? "true" : undefined} data-target={`level-${i}`} onClick={() => (window as unknown as { __dlg: { level: (n: number) => void } }).__dlg.level(i)}>{l}</button>
            ))}
          </div>
        </div>
        <Sample open={level >= 2} which="friday" playing={clip} playSec={playSec} onPlay={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(!clip)} />
      </>
    );
  }

  const composer = (demo === "hero" || demo === "picker") ? (
    <div className="dp-study-chat__composer">
      {demo === "picker" ? (
        <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
          {LEVELS.map((l, i) => (
            /* P16 round 4 (Mudit): one depth is picked before asking, so only that chip is filled. */
            <button key={l} type="button" role="radio" aria-checked={pick === i} aria-pressed={i === pick} aria-current={i === pick ? "true" : undefined} data-target={`depth-${i}`} className="dlg-depth__opt" onClick={() => setPick(i)}>{l}</button>
          ))}
        </div>
      ) : null}
      <div className="dp-study-chat__composer-box">
        {typed ? <p className="dp-study-chat__composer-text">{typed}</p> : <p className="dp-study-chat__composer-placeholder">{dialogueCopy.composerPlaceholder}</p>}
        <button type="button" className="dp-study-chat__composer-send dlg-live__send" data-target="send" data-ready={typed ? "" : undefined} aria-label="Send" onClick={() => (window as unknown as { __dlg: { send: () => void } }).__dlg.send()}>
          {analyzing ? <LoaderArcIcon className="dlg-spin" /> : <ArrowUpIcon />}
        </button>
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
      <div className="dlg-stage__body">{body}{clearH ? <div aria-hidden style={{ flex: `0 0 ${clearH}px` }} /> : null}</div>
      {composer}
      {frameEl ? createPortal(<Annotation note={note} />, frameEl) : null}
    </div>
  );
}
