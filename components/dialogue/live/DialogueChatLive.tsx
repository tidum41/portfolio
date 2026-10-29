"use client";

import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { QUOTE_LIST, PARAGRAPH_ANSWER_WALL } from "@/lib/dialogue/product/sampleData";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, ChevronUpIcon, LoaderArcIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";

/*
 * Round P10: an interactive recreation of Dialogue's study chat, driven by real state
 * changes. Every duration and easing below is copied from the real frontend capture
 * (/workspace/dialogue-anim, run 2 at 60 fps; keyframes.css, styles.json, spec.md):
 *   click +27 ms   empty state swaps to the user bubble and the "Analyzing interviews" row (hard cut)
 *                  ellipsis dots 1500 ms linear loop; send button shows a spinner (spin 1000 ms linear)
 *   +1655 ms       querying card mounts with tw-animate `animate-in fade-in-50 duration-300` (opacity 0.5 to 1)
 *   +wait          server wait; the real one is ~65 s, compressed to 2500 ms as spec.md recommends
 *   +996 ms        first text; text grows in bursts (median 32 ms apart, median 6 chars) at ~137 chars/s
 *   cards          mount whole, no fade or transform; the only motion is the message list's
 *                  scroll-to-bottom, ease-out cubic over ~133 ms
 * Taps on a side or a quote are concept interactions (not in the recording); they reuse the
 * same card behaviour: hard mount plus the 133 ms scroll.
 * All text and numbers are the invented Hearthside mock.
 */
export const LIVE_TIMING = {
  swapMs: 27,
  queryingMs: 1655,
  waitMs: 2500,
  firstTextMs: 996,
  burstGapMs: 32,
  scrollMs: 133,
} as const;
/**
 * Demo timing for the case-study recordings (`quick`): the real ~65 s server wait carries no
 * design decision, so the wait collapses to one beat of "Analyzing interviews" and the answer
 * streams. Querying participants (and its "300 queried" count) is skipped.
 */
export const QUICK_TIMING = { analyzingMs: 450, firstTextMs: 150 } as const;

const QUESTION = "How do shoppers read \u201cArrives by Friday\u201d?";
/**
 * Chart rule, shared by both variants: when a question asks how much of the study holds a view,
 * the answer carries its chart, whatever depth was picked. A count without its bar can't be checked
 * at a glance. Questions about why or how skip the chart.
 */
const QUESTION_IS_HOW_MUCH = true;
const FINDING =
  "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";

/** Depth levels, shallow to deep: insight, chart, the people behind a side, the source clip. */
export const LEVELS = ["Insight", "Chart", "People", "Source"] as const;
type Variant = "base" | "picker" | "toggles" | "before" | "every";
/** The old answer (Dialogue today): one fluent paragraph, streamed. */
const BEFORE_TEXT = PARAGRAPH_ANSWER_WALL.join("\n");
const BEFORE_QUESTION = QUESTION;

type Stage = "idle" | "analyzing" | "querying" | "queried" | "streaming" | "answered";

// Deterministic burst sizes, 1 to 12 chars with a median near 6 (spec.md section 4).
const BURSTS = [6, 3, 9, 5, 12, 6, 2, 7, 4, 10, 6, 8, 1, 6, 11, 5, 7, 3, 6, 9];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function DialogueChatLive({
  height = 560,
  startAnswered = false,
  onStage,
  variant = "base",
  chrome = true,
  quick = false,
  initialSide = false,
  initialMore = false,
}: {
  /** Static frames: open the side sample (and its +73 page) on first paint. */
  initialSide?: boolean;
  initialMore?: boolean;
  variant?: Variant;
  /** Panel chrome (Study chat header, 300-interview subtitle, composer). Off in the case study unless it explains the moment. */
  chrome?: boolean;
  quick?: boolean;
  height?: number;
  startAnswered?: boolean;
  onStage?: (s: string) => void;
}) {
  const [stage, setStage] = useState<Stage>(startAnswered ? "answered" : "idle");
  const [len, setLen] = useState(startAnswered ? (variant === "before" ? BEFORE_TEXT : FINDING).length : 0);
  const [sideOpen, setSideOpen] = useState(initialSide);
  const [moreOpen, setMoreOpen] = useState(initialMore);
  const [playing, setPlaying] = useState<string | null>(null);
  const clipOpen = playing !== null;
  const setClipOpen = (on: boolean) => setPlaying(on ? QUOTE_LIST[0].participant : null);
  const answerText = variant === "before" ? BEFORE_TEXT : FINDING;
  // depth: 0 insight, 1 chart, 2 people, 3 source. base starts at the chart (shipped behaviour).
  const [pick, setPick] = useState(1); // variant A: level chosen before asking
  const [chartOpen, setChartOpen] = useState(variant === "base" || startAnswered);
  const showChart = chartOpen || QUESTION_IS_HOW_MUCH;
  const openTo = (lvl: number) => {
    if (lvl >= 1) setChartOpen(true);
    if (lvl >= 2) setSideOpen(true);
    if (lvl >= 3) setClipOpen(true);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef(0);

  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => { timers.current.forEach(clearTimeout); cancelAnimationFrame(raf.current); }, []);
  useEffect(() => { onStage?.([stage, sideOpen ? "side" : "", clipOpen ? "clip" : ""].join(" ").trim()); }, [stage, sideOpen, clipOpen, onStage]);

  // react-scroll-to-bottom behaviour: after content grows, ease the list to the bottom in ~133 ms.
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const from = el.scrollTop;
    const to = el.scrollHeight - el.clientHeight;
    if (to <= from + 0.5) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.scrollTop = to; return; }
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / LIVE_TIMING.scrollMs);
      el.scrollTop = from + (to - from) * easeOutCubic(p);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);
  useLayoutEffect(() => { scrollToBottom(); }, [stage, len, sideOpen, playing, scrollToBottom]);

  const ask = () => {
    if (stage !== "idle") return;
    later(LIVE_TIMING.swapMs, () => setStage("analyzing"));
    let at: number;
    if (quick) {
      at = LIVE_TIMING.swapMs + QUICK_TIMING.analyzingMs + QUICK_TIMING.firstTextMs;
    } else {
      later(LIVE_TIMING.queryingMs, () => setStage("querying"));
      const queriedAt = LIVE_TIMING.queryingMs + 300 + LIVE_TIMING.waitMs;
      later(queriedAt, () => setStage("queried"));
      at = queriedAt + LIVE_TIMING.firstTextMs;
    }
    let n = 0;
    let i = 0;
    later(at, () => setStage("streaming"));
    while (n < answerText.length) {
      n = Math.min(answerText.length, n + BURSTS[i++ % BURSTS.length]);
      const v = n;
      later(at, () => setLen(v));
      at += LIVE_TIMING.burstGapMs + (i % 3) * 8; // ~137 chars/s overall
    }
    later(at + 120, () => {
      setStage("answered");
      if (variant === "picker") openTo(pick);
      // First try (Levels): every level opens with the answer, the clip included.
      if (variant === "every") { setChartOpen(true); setSideOpen(true); setPlaying(QUOTE_LIST[0].participant); }
    });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("idle"); setLen(0); setSideOpen(false); setPlaying(null); setChartOpen(variant === "base");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const busy = stage !== "idle" && stage !== "answered";
  const asked = stage !== "idle";

  return (
    <div
      className={["dp-study-chat dlg-live", chrome ? "" : "dlg-live--bare", dialogueProductFontClassName].filter(Boolean).join(" ")}
      style={{ height: height || undefined }} /* 0 = fit content (static frames) */
      data-stage={stage}
      data-side={sideOpen ? "open" : "closed"}
      data-clip={clipOpen ? "open" : "closed"}
      data-variant={variant}
      data-depth={clipOpen ? 3 : sideOpen ? 2 : showChart ? 1 : 0}
    >
      {chrome ? <div className="dp-study-chat__head">
        <div className="dp-study-chat__head-top">
          <div className="dp-study-chat__head-text">
            <div className="dp-study-chat__title-row">
              <p className="dp-study-chat__title">{asked ? dialogueCopy.assistantTitle : "New chat"}</p>
              <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
            </div>
          </div>
          <button type="button" className="dp-study-chat__minimize dlg-live__reset" onClick={reset} aria-label="Reset demo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div> : null}

      <div className="dp-study-chat__scroll" ref={scrollRef}>
        <div className="dp-study-chat__body">
          {!asked ? (
            <div className="dlg-empty">
              {chrome ? <p className="dlg-empty__lead">Ask questions across all 300 interviews.</p> : null}
              <button type="button" className="dlg-suggest" data-target="ask" onClick={ask}>
                + {variant === "before" ? BEFORE_QUESTION : QUESTION}
              </button>
              {variant === "before" ? null : (
                <button type="button" className="dlg-suggest" disabled>
                  + Which segments hesitated most at checkout?
                </button>
              )}
            </div>
          ) : (
            <UserMessageBubble>{variant === "before" ? BEFORE_QUESTION : QUESTION}</UserMessageBubble>
          )}

          {stage === "analyzing" ? (
            <p className="dlg-analyzing">
              Analyzing interviews
              <span className="dlg-ellipsis dlg-ellipsis--1">.</span>
              <span className="dlg-ellipsis dlg-ellipsis--2">.</span>
              <span className="dlg-ellipsis dlg-ellipsis--3">.</span>
            </p>
          ) : null}

          {!quick && stage !== "idle" && stage !== "analyzing" ? (
            <div className={stage === "querying" ? "dlg-querying animate-in fade-in-50 duration-300" : "dlg-querying"}>
              <span className="dlg-querying__label">Querying participants</span>
              {stage === "querying" ? (
                <LoaderArcIcon className="dlg-spin" />
              ) : (
                <span className="dlg-querying__count">300 queried</span>
              )}
            </div>
          ) : null}

          {variant === "before" && (stage === "streaming" || stage === "answered") ? (
            // Dialogue today: the reply is plain prose under the question, no avatar or label (dialogue-anim final.html).
            <div className="dp-text-prose-sm dp-prose-stack dlg-before">
              {answerText.slice(0, len).split("\n").map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
            </div>
          ) : null}

          {variant !== "before" && (stage === "streaming" || stage === "answered") ? (
            <ChartVizCard title={FINDING.slice(0, len)}>
              {stage === "answered" && showChart ? (
                <>
                <div className="dlg-live__bar">
                  <ChartStackedBar
                    total={300}
                    segments={[
                      { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
                      { label: "Unsure", value: 75, display: "75 of 300" },
                    ]}
                  />
                  <button
                    type="button"
                    className="dlg-live__side dlg-live__side--unsure"
                    data-target="side"
                    aria-label="Open the 75 unsure"
                    aria-expanded={sideOpen}
                    onClick={() => setSideOpen(true)}
                  />
                </div>
                </>
              ) : null}
            </ChartVizCard>
          ) : null}

          {/* Variant B: the depth row lives inside the answer; each level opens on a tap. */}
          {variant === "toggles" && stage === "answered" ? (
            <div className="dlg-depth dlg-depth--inline" role="group" aria-label="Answer depth">
              {LEVELS.map((l, i) => {
                const on = i === 0 || (i === 1 && showChart) || (i === 2 && sideOpen) || (i === 3 && clipOpen);
                return (
                  <button
                    key={l}
                    type="button"
                    className="dlg-depth__opt"
                    aria-pressed={on}
                    data-target={i === 2 ? "people" : i === 3 ? "source" : `level-${i}`}
                    onClick={() => { if (i === 2) setSideOpen(!sideOpen); if (i === 3) { setSideOpen(true); setClipOpen(!clipOpen); } }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          ) : null}

          {sideOpen ? (
            <div
              className="dlg-live__sample"
            >
              <LiveSideSample total={75} playing={playing} onPlay={setPlaying} more={moreOpen} onMore={() => setMoreOpen(true)} onCollapse={() => { setSideOpen(false); setPlaying(null); setMoreOpen(false); }} />
            </div>
          ) : null}

          {/* Variant A: after the answer, follow-ups re-ask the same answer at another depth. */}
          {variant === "picker" && stage === "answered" ? (
            <div className="dlg-followups">
              {!sideOpen ? (
                <button type="button" className="dlg-suggest" data-target="more-people" onClick={() => openTo(2)}>
                  + Show the people behind it
                </button>
              ) : null}
              {!clipOpen ? (
                <button type="button" className="dlg-suggest" data-target="more-source" onClick={() => openTo(3)}>
                  + Play the source
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {chrome || variant === "picker" ? <div className="dp-study-chat__composer">
        {variant === "picker" ? (
          <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
            {LEVELS.map((l, i) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={pick === i}
                data-target={`depth-${i}`}
                className="dlg-depth__opt"
                disabled={asked}
                onClick={() => setPick(i)}
              >
                {l}
              </button>
            ))}
          </div>
        ) : null}
        <div className="dp-study-chat__composer-box">
          <p className="dp-study-chat__composer-placeholder">{dialogueCopy.composerPlaceholder}</p>
          <span className="dp-study-chat__composer-send dlg-live__send" aria-hidden>
            {busy ? <LoaderArcIcon className="dlg-spin" /> : <ArrowUpIcon />}
          </span>
        </div>
      </div> : null}
    </div>
  );
}

/**
 * One side of the count, sampled (SideSample's markup), with the clip player attached to the row
 * that is playing: the selected row (dp-clip-quote--selected) carries the speaker's name and the
 * player, a chevron collapses it, and tapping another row moves the player there.
 */
/** Illustrative rows behind +73 more, for the static "more" frame. */
const MORE_QUOTES = [
  { participant: "Ada", time: "11:04\u201311:15", quote: "Is that this week or next?" },
  { participant: "Luis", time: "22:40\u201322:52", quote: "I looked for an actual date and didn't see one." },
  { participant: "Tess", time: "05:18\u201305:29", quote: "Friday felt like a guess, so I waited." },
];

function LiveSideSample({ total, playing, onPlay, more, onMore, onCollapse }: { total: number; playing: string | null; onPlay: (p: string | null) => void; more: boolean; onMore: () => void; onCollapse: () => void }) {
  const rows = more ? [...QUOTE_LIST, ...MORE_QUOTES] : QUOTE_LIST;
  const shown = rows.length;
  return (
    <div className="dp-side-sample" data-annotate-part="side-sample">
      <p className="dp-side-sample__head dp-text-body">
        <span className="dp-summary__emph">{total}</span> unsure, {shown} shown
        <button type="button" className="dlg-clip-collapse" data-target="side-collapse" aria-label="Collapse the 75 unsure" onClick={onCollapse}>
          <ChevronUpIcon />
        </button>
      </p>
      <div className="dp-clip-quotes">
        {rows.map((q) => {
          const on = playing === q.participant;
          return (
            <div
              key={q.participant}
              className={["dp-clip-quote", on ? "dp-clip-quote--selected" : ""].filter(Boolean).join(" ")}
              data-target={`quote-${q.participant.toLowerCase()}`}
              data-playing={on ? "" : undefined}
              onClick={() => { if (!on) onPlay(q.participant); }}
            >
              <p className="dp-clip-quote__who">
                <WaveformIcon className="dp-clip-quote__icon" />
                <span className="dp-clip-quote__name">{q.participant}</span>
                <span className="dp-clip-quote__time">{q.time}</span>
                {on ? (
                  <button
                    type="button"
                    className="dlg-clip-collapse"
                    data-target="collapse"
                    aria-label={`Collapse ${q.participant}'s clip`}
                    onClick={(e) => { e.stopPropagation(); onPlay(null); }}
                  >
                    <ChevronUpIcon />
                  </button>
                ) : null}
              </p>
              <p className="dp-clip-quote__text">{q.quote}</p>
              {on ? (
                <div className="dlg-live__clip" style={clipRange(q.time)}>
                  <DialogueInterviewPlayer current={q.time.split(/[\u2013-]/)[0]} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="dp-sources">
        {more ? (
          <SourcePill name={`+${total - shown} more`} time="" />
        ) : (
          <button type="button" className="dlg-more" data-target="more" onClick={onMore}>
            <SourcePill name={`+${total - shown} more`} time="" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Marks the quote's span on the player's scrubber (the 42:10 interview), e.g. 18:27 to 18:49. */
function clipRange(time: string): React.CSSProperties {
  const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const total = sec("42:10");
  return { ["--clip-a" as string]: `${(a / total) * 100}%`, ["--clip-w" as string]: `${((z - a) / total) * 100}%` } as React.CSSProperties;
}
