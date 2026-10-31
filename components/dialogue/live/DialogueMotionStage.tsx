"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, ChevronUpIcon, LoaderArcIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { PARAGRAPH_ANSWER_WALL, QUOTE_LIST, QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";
import type { MotionDemo } from "@/components/dialogue/motion/stages";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";

/* P16: the thin answer stays on the page's one question, "Arrives by Friday". Two shoppers is too thin for a chart; the
   tapped chip counts repeat shoppers from the same 300 interviews (88 of 125, the segment line the answer card already uses). */
const THIN_QUESTION = "Did anyone miss a delivery over \u201cArrives by Friday\u201d?";
const THIN_FINDING = "Two of 300 shoppers said they missed a delivery after reading it as this Friday.";
const THIN_CHIPS = [
  "How many repeat shoppers read it as this Friday?",
  "What did shoppers say about the delivery date?",
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

type SideWhich = "friday" | "unsure" | false;
type SampleWhich = "friday" | "unsure";

/*
 * P11 motion stage: one storyboard per case-study video (build/p11-motion-spec.md, design/TASTE.md "Motion").
 * The recorder (scripts/record-dialogue-motion.mjs) drives it through window.__dlg; the page never
 * scrolls itself. New content grows below the tapped element (400 ms, cubic-bezier(0.2, 0, 0, 1)),
 * entrances fade and rise 8 px (350 ms), nothing pops. Hearthside mock data, same as the page.
 */
export type { MotionDemo } from "@/components/dialogue/motion/stages";

const SAMPLE_META: Record<SampleWhich, { rows: typeof QUOTE_LIST; count: number; of: number; label: string }> = {
  friday: { rows: QUOTE_LIST_FRIDAY, count: 225, of: 300, label: "read it as this Friday" },
  unsure: { rows: QUOTE_LIST, count: 75, of: 300, label: "unsure" },
};

const QUESTION = "How do shoppers read \u201cArrives by Friday\u201d?";
const FINDING = "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";
const LEVELS = ["Insight", "Chart", "People", "Source"] as const;
const MEI = QUOTE_LIST[0];
const ANA = QUOTE_LIST_FRIDAY[0];

/* Height grows via grid rows (0fr→1fr open, fade then fold on close). Panel size stays fixed; its body scrolls. */
function Grow({ open, children, className, closeMs = 450 }: { open: boolean; children: ReactNode; className?: string; closeMs?: number }) {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); setLeaving(false); return; }
    if (!mounted) return;
    setLeaving(true);
    // Fade 150ms then fold 300ms; unmount after 450ms (P14 item 8).
    const t = setTimeout(() => { setMounted(false); setLeaving(false); }, closeMs);
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
/* P16 round 3: each participant's session has its own length (mock), and its own illustrated still. */
const SESSION_TOTAL: Record<string, string> = { Ana: "31:45", Dev: "27:30", Mei: "42:10", Owen: "35:05" };
function clipRange(time: string, totalStr = "42:10"): CSSProperties {
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const total = sec(totalStr);
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
function QuoteRow({ q, open, onTap, playSec, playable = false }: { q: { participant: string; time: string; quote: string }; open: boolean; onTap?: () => void; playSec?: number; playable?: boolean }) {
  const start = q.time.split(/[\u2013-]/)[0];
  const total = SESSION_TOTAL[q.participant] ?? "42:10";
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
        {/* P16 round 3: the Source level marks each row as playable; tapping a row is the next step. */}
        {playable && !open ? <span className="dp-clips-link dlg-play-clip">Play clip</span> : null}
      </p>
      <p className="dp-clip-quote__text">{q.quote}</p>
      <Grow open={open} closeMs={700}>
        <div className="dlg-live__clip" data-who={q.participant.toLowerCase()} style={clipRange(q.time, total)}>
          <DialogueInterviewPlayer current={playSec !== undefined ? fmt(sec(start) + playSec) : start} total={total} />
        </div>
      </Grow>
    </div>
  );
}

function Sample({ open, which = "unsure", playing, onPlay, playSec, onCollapse, playable = false }: { open: boolean; which?: SampleWhich; playing: boolean; onPlay?: () => void; playSec?: number; onCollapse?: () => void; playable?: boolean }) {
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
            <QuoteRow key={q.participant} q={q} open={playing && q === lead} onTap={q === lead ? onPlay : undefined} playSec={playSec} playable={playable} />
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
        const id = setInterval(() => { n++; setTyped(QUESTION.slice(0, n)); if (n >= QUESTION.length) { clearInterval(id); res(); } }, 1000 / cps);
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
          // P16 round 3: Source marks the rows playable; Mei's clip opens only when Mei is tapped.
          if (i < 3) api.clip(false);
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
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); const el = document.querySelector<HTMLElement>(sel);
        if (!body || !el) return;
        const from = body.scrollTop, to = Math.max(0, from + el.getBoundingClientRect().top - body.getBoundingClientRect().top - pad), t0 = performance.now();
        const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
        const step = (now: number) => { const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      },
      chase: (ms = 1300, rate = 0.07) => {
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); if (!body) return;
        const t0 = performance.now();
        const step = (now: number) => {
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
        const body = document.querySelector<HTMLElement>(".dlg-stage__body"); const el = document.querySelector<HTMLElement>(sel);
        if (!body || !el) return;
        const b = body.getBoundingClientRect(), r = el.getBoundingClientRect();
        const to = Math.max(0, Math.min(body.scrollHeight - body.clientHeight, body.scrollTop + r.bottom - (b.bottom - pad)));
        const from = body.scrollTop, t0 = performance.now();
        if (ms <= 0) { body.scrollTop = to; return; }
        const step = (now: number) => { const p = Math.min(1, (now - t0) / ms); body.scrollTop = from + (to - from) * ease(p); if (p < 1) requestAnimationFrame(step); };
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
          <div className="dp-clip-quotes dlg-live__sample"><QuoteRow q={ANA} open={false} /></div>
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
          <AnswerCard sideOpen={side} onSide={(w) => setSide(w)} />
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
            <InfoCircleIcon className="dp-low-signal__icon" />
            <p className="dp-low-signal__text">Early signal, 2 people. A chart needs 3 or more.</p>
          </div>
          <p className="dp-clips-link">View 2 clips</p>
          {/* P16: the chips say what they are, follow-ups the same interviews can answer with a count. */}
          <p className="dlg-thin__label">Suggested follow-ups with enough answers to count</p>
          <div className="dlg-thin__chips" data-target="thin-chips">
            {THIN_CHIPS.map((c, i) => (
              <button key={c} type="button" className="dlg-suggest dlg-thin__chip" data-target={`chip-${i}`} aria-pressed={thinAsk && i === 0} onClick={() => (window as unknown as { __dlg: { ask: () => void } }).__dlg.ask()}>{c}</button>
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
              <ChartStackedBar
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
          <AnswerCard chart={level >= 1} sideOpen={level >= 2 ? "unsure" : false} />
          <div className="dlg-depth dlg-depth--inline" role="group" aria-label="Answer depth">
            {LEVELS.map((l, i) => (
              <button key={l} type="button" className="dlg-depth__opt" aria-pressed={i <= level} aria-current={i === level ? "true" : undefined} data-target={`level-${i}`} onClick={() => (window as unknown as { __dlg: { level: (n: number) => void } }).__dlg.level(i)}>{l}</button>
            ))}
          </div>
        </div>
        <Sample open={level >= 2} which="unsure" playing={clip} playSec={playSec} playable={level >= 3} onPlay={() => (window as unknown as { __dlg: { clip: (b: boolean) => void } }).__dlg.clip(!clip)} />
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
      <div className="dlg-stage__body">{body}{clearH ? <div aria-hidden style={{ flex: `0 0 ${clearH}px` }} /> : null}</div>
      {composer}
      {frameEl ? createPortal(<Annotation note={note} />, frameEl) : null}
    </div>
  );
}
