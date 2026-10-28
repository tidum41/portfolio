"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SideSample from "@/components/dialogue/product/scenarios/SideSample";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import { ArrowUpIcon, LoaderArcIcon } from "@/components/dialogue/product/icons";
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

const QUESTION = "How did shoppers read \u2018Arrives by Friday\u2019?";
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
type Variant = "base" | "picker" | "toggles";

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
}: {
  variant?: Variant;
  height?: number;
  startAnswered?: boolean;
  onStage?: (s: string) => void;
}) {
  const [stage, setStage] = useState<Stage>(startAnswered ? "answered" : "idle");
  const [len, setLen] = useState(startAnswered ? FINDING.length : 0);
  const [sideOpen, setSideOpen] = useState(false);
  const [clipOpen, setClipOpen] = useState(false);
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
  useLayoutEffect(() => { scrollToBottom(); }, [stage, len, sideOpen, clipOpen, scrollToBottom]);

  const ask = () => {
    if (stage !== "idle") return;
    later(LIVE_TIMING.swapMs, () => setStage("analyzing"));
    later(LIVE_TIMING.queryingMs, () => setStage("querying"));
    const queriedAt = LIVE_TIMING.queryingMs + 300 + LIVE_TIMING.waitMs;
    later(queriedAt, () => setStage("queried"));
    let at = queriedAt + LIVE_TIMING.firstTextMs;
    let n = 0;
    let i = 0;
    later(at, () => setStage("streaming"));
    while (n < FINDING.length) {
      n = Math.min(FINDING.length, n + BURSTS[i++ % BURSTS.length]);
      const v = n;
      later(at, () => setLen(v));
      at += LIVE_TIMING.burstGapMs + (i % 3) * 8; // ~137 chars/s overall
    }
    later(at + 120, () => {
      setStage("answered");
      if (variant === "picker") openTo(pick);
    });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("idle"); setLen(0); setSideOpen(false); setClipOpen(false); setChartOpen(variant === "base");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const busy = stage !== "idle" && stage !== "answered";
  const asked = stage !== "idle";

  return (
    <div
      className={["dp-study-chat dlg-live", dialogueProductFontClassName].join(" ")}
      style={{ height }}
      data-stage={stage}
      data-side={sideOpen ? "open" : "closed"}
      data-clip={clipOpen ? "open" : "closed"}
      data-variant={variant}
      data-depth={clipOpen ? 3 : sideOpen ? 2 : showChart ? 1 : 0}
    >
      <div className="dp-study-chat__head">
        <div className="dp-study-chat__head-top">
          <div className="dp-study-chat__head-text">
            <div className="dp-study-chat__title-row">
              <p className="dp-study-chat__title">{asked ? dialogueCopy.assistantTitle : "New chat"}</p>
              <span className="dp-study-chat__beta">{dialogueCopy.betaLabel}</span>
            </div>
            <p className="dp-study-chat__sub">{dialogueCopy.studySubtitle}</p>
          </div>
          <button type="button" className="dp-study-chat__minimize dlg-live__reset" onClick={reset} aria-label="Reset demo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="dp-study-chat__scroll" ref={scrollRef}>
        <div className="dp-study-chat__body">
          {!asked ? (
            <div className="dlg-empty">
              <p className="dlg-empty__lead">Ask questions across all 300 interviews.</p>
              <button type="button" className="dlg-suggest" data-target="ask" onClick={ask}>
                + {QUESTION}
              </button>
              <button type="button" className="dlg-suggest" disabled>
                + Which segments hesitated most at checkout?
              </button>
            </div>
          ) : (
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
          )}

          {stage === "analyzing" ? (
            <p className="dlg-analyzing">
              Analyzing interviews
              <span className="dlg-ellipsis dlg-ellipsis--1">.</span>
              <span className="dlg-ellipsis dlg-ellipsis--2">.</span>
              <span className="dlg-ellipsis dlg-ellipsis--3">.</span>
            </p>
          ) : null}

          {stage !== "idle" && stage !== "analyzing" ? (
            <div className={stage === "querying" ? "dlg-querying animate-in fade-in-50 duration-300" : "dlg-querying"}>
              <span className="dlg-querying__label">Querying participants</span>
              {stage === "querying" ? (
                <LoaderArcIcon className="dlg-spin" />
              ) : (
                <span className="dlg-querying__count">300 queried</span>
              )}
            </div>
          ) : null}

          {stage === "streaming" || stage === "answered" ? (
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
                    className="dlg-live__side"
                    data-target="side"
                    aria-label="Open the 75 unsure"
                    aria-expanded={sideOpen}
                    onClick={() => setSideOpen(true)}
                  />
                </div>
                <p className="dlg-segment" data-target="segment">
                  Repeat shoppers: <span className="dp-summary__emph">88 of 125</span> read it as this Friday
                </p>
                </>
              ) : null}
            </ChartVizCard>
          ) : null}

          {variant === "toggles" && stage === "answered" && !sideOpen ? (
            <button type="button" className="dlg-disclose" data-target="people" onClick={() => setSideOpen(true)}>
              Show the people behind it
            </button>
          ) : null}

          {sideOpen ? (
            <div
              className="dlg-live__sample"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(".dp-quote-row, .dp-clip-quote, .dp-quote")) setClipOpen(true);
              }}
            >
              <SideSample label="unsure" total={75} />
              {clipOpen ? (
                <div className="dlg-live__clip">
                  <DialogueInterviewPlayer />
                </div>
              ) : null}
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

      <div className="dp-study-chat__composer">
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
      </div>
    </div>
  );
}
