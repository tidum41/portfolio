"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import StudyChatShell from "@/components/dialogue/product/StudyChatShell";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ClipQuotes from "@/components/dialogue/product/ClipQuotes";
import QuoteFrameFigure from "@/components/dialogue/product/scenarios/QuoteFrameFigure";
import SideSample from "@/components/dialogue/product/scenarios/SideSample";
import { LoaderArcIcon } from "@/components/dialogue/product/icons";

/*
 * Round P10 motion demos, composed only from Paper-derived product components.
 *
 * Timing sources. MEASURED: Dialogue's real study chat, recorded frame by frame in
 * /workspace/dialogue-anim/remotion/spec.md (run 2, 60 fps). From that recording:
 * the user bubble replaces the empty state with a hard cut; the querying card enters
 * with opacity 0.5 to 1 over 300 ms; the spinner turns at 1000 ms linear; text streams
 * at about 137 characters a second; cards land whole with no fade, and the only motion
 * is a scroll ease-out of about 133 ms.
 * ESTIMATED (not measured, chosen to read well in a loop): the 65 s server wait is
 * compressed to 1200 ms; the tap cue lasts 450 ms; holds between steps are 700 to 3200 ms.
 */
const QUESTION = "How did shoppers read \u2018Arrives by Friday\u2019?";
const FINDING =
  "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";
const CHARS_PER_MS = 0.137; // measured stream rate

type Scene = "ask" | "open-side" | "clip";
type Step = { at: number; phase: number };

// ms from loop start (estimates built on the measured transitions above)
const TIMELINES: Record<Scene, { steps: Step[]; loop: number; final: number }> = {
  ask: {
    steps: [
      { at: 0, phase: 0 }, // empty state with suggested prompts
      { at: 900, phase: 1 }, // tap cue on the first prompt (estimate 450 ms)
      { at: 1350, phase: 2 }, // bubble plus querying card (hard cut, measured)
      { at: 2550, phase: 3 }, // "300 queried" swap (wait compressed, estimate)
      { at: 2900, phase: 4 }, // sentence streams (measured rate)
      { at: 3600, phase: 5 }, // bar lands whole (measured: no fade)
    ],
    loop: 7600,
    final: 5,
  },
  "open-side": {
    steps: [
      { at: 0, phase: 0 }, // answer, count only
      { at: 1200, phase: 1 }, // tap cue on the 75 side
      { at: 1650, phase: 2 }, // sample of the side lands whole
    ],
    loop: 5600,
    final: 2,
  },
  clip: {
    steps: [
      { at: 0, phase: 0 }, // quote rows
      { at: 1100, phase: 1 }, // tap cue on Mei's row
      { at: 1550, phase: 2 }, // player lands in place
    ],
    loop: 6400,
    final: 2,
  },
};

function useLoop(scene: Scene, paused: boolean, nonce: number) {
  const t = TIMELINES[scene];
  const [phase, setPhase] = useState(t.final);
  const [streamed, setStreamed] = useState(FINDING.length);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduce || !el || paused) return; // static fallback: the final state
    let timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    let running = false;
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(raf);
    };
    const run = () => {
      clear();
      for (const s of t.steps) {
        timers.push(
          setTimeout(() => {
            setPhase(s.phase);
            if (scene === "ask" && s.phase === 4) {
              const start = performance.now();
              const tick = () => {
                const n = Math.min(FINDING.length, Math.round((performance.now() - start) * CHARS_PER_MS));
                setStreamed(n);
                if (n < FINDING.length) raf = requestAnimationFrame(tick);
              };
              setStreamed(0);
              raf = requestAnimationFrame(tick);
            }
          }, s.at),
        );
      }
      timers.push(setTimeout(run, t.loop));
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          timers.push(setTimeout(run, 600));
        } else if (!entry.isIntersecting && running) {
          running = false;
          clear();
          setPhase(t.final);
          setStreamed(FINDING.length);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [scene, t, paused, nonce]);

  return { ref, phase, streamed };
}

/** Case-study annotation, not product UI: a cherry ring where the reader's tap lands. */
function TapCue({ on, style }: { on: boolean; style: React.CSSProperties }) {
  return <span className={["dlg-tap-cue", on ? "dlg-tap-cue--on" : ""].join(" ")} style={style} aria-hidden />;
}

function Bar({ landed = true }: { landed?: boolean }) {
  return (
    <div className={landed ? "dlg-land" : "dlg-hidden"}>
      <ChartStackedBar
        total={300}
        segments={[
          { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
          { label: "Unsure", value: 75, display: "75 of 300" },
        ]}
      />
    </div>
  );
}

export default function DialogueFlowDemo({ scene }: { scene: Scene }) {
  const [paused, setPaused] = useState(false);
  const [nonce, setNonce] = useState(0);
  const { ref, phase, streamed } = useLoop(scene, paused, nonce);
  let body: ReactNode = null;

  if (scene === "ask") {
    body = (
      <StudyChatShell hideComposer>
        {phase >= 2 ? <UserMessageBubble>{QUESTION}</UserMessageBubble> : null}
        {phase === 2 ? (
          <p className="dlg-querying dlg-enter">
            <LoaderArcIcon className="dlg-querying__spin" />
            <span>Querying participants</span>
          </p>
        ) : null}
        {phase >= 3 ? <p className="dlg-querying">300 queried</p> : null}
        {phase >= 4 ? (
          <ChartVizCard title={FINDING.slice(0, streamed)}>
            <Bar landed={phase >= 5} />
          </ChartVizCard>
        ) : null}
        {phase < 2 ? (
          <div className="dlg-empty">
            <p className="dlg-empty__lead">Ask questions across all 300 interviews.</p>
            {/* Real empty state (contact sheet, run 1): suggested prompts as + rows; the click starts the answer. */}
            <div className="dlg-rel">
              <p className="dlg-suggest">+ {QUESTION}</p>
              <TapCue on={phase >= 1} style={{ left: 10, top: 2 }} />
            </div>
            <p className="dlg-suggest">+ Which segments hesitated most at checkout?</p>
          </div>
        ) : null}
      </StudyChatShell>
    );
  } else if (scene === "open-side") {
    body = (
      <StudyChatShell hideComposer>
        <UserMessageBubble>{QUESTION}</UserMessageBubble>
        <div className="dlg-rel">
          <ChartVizCard title={FINDING}>
            <Bar />
          </ChartVizCard>
          <TapCue on={phase >= 1} style={{ right: 34, bottom: 30 }} />
        </div>
        {phase >= 2 ? (
          <div className="dlg-land">
            <SideSample label="unsure" total={75} />
          </div>
        ) : null}
      </StudyChatShell>
    );
  } else {
    body = (
      <div className="dialogue-product-root dp-chat-panel-typography">
        <div className="dlg-rel">
          <ClipQuotes />
          <TapCue on={phase >= 1} style={{ left: 40, top: 22 }} />
        </div>
        {phase >= 2 ? (
          <div className="dlg-land">
            <QuoteFrameFigure />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={ref} className="dlg-flow-demo" data-scene={scene} data-phase={phase}>
      {/* Measured: the real thread follows new content with a ~133 ms ease-out scroll. */}
      {/* Rachel Chen: muted loops carry a small pause and replay pair. */}
      <div className="dlg-demo-ctl">
        <button type="button" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play demo" : "Pause demo"}>
          {paused ? "Play" : "Pause"}
        </button>
        <button type="button" onClick={() => { setPaused(false); setNonce((n) => n + 1); }} aria-label="Replay demo">
          Replay
        </button>
      </div>
      <div className={scene === "ask" && phase >= 4 ? "dlg-scroll dlg-scroll--down" : "dlg-scroll"}>{body}</div>
    </div>
  );
}
