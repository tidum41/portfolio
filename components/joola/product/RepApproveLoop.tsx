"use client";

import { useRef } from "react";
import DemoCursor, { type CursorCue } from "./DemoCursor";
import LoopFrame from "./LoopFrame";
import RepDecisionPanel, { type RepStep } from "./RepDecisionPanel";
import { useLoop } from "./useLoop";
import { REP_ORDER } from "./data";

const CHARS = REP_ORDER.reason.length;

type Frame = { step: RepStep; cursor: CursorCue };

const REASON = ".jp-ac-reasonbox .jp-input";
const APPROVE = ".jp-ac-actions .jp-btn--primary";
const AWAY: CursorCue = { phase: "away" };
const ON_REASON: CursorCue = { phase: "over", target: REASON, shape: "text", at: [0.3, 0.5] };
const ON_APPROVE: CursorCue = { phase: "over", target: APPROVE };

/**
 * About 8s, in the prototype's own states, like a screen recording: the facts hold while the
 * pointer rests, it eases to the Reason field (an I-beam over text), clicks, the field takes
 * focus and lists the quick reasons, the rep types Paid on time, the pointer eases to Approve
 * (a hand, with the hover fill), presses (scale 0.97), the button shows Approving, the decision
 * record holds, and the pointer moves off.
 */
const STEPS: readonly (readonly [Frame, number])[] = [
  [{ step: { kind: "idle" }, cursor: AWAY }, 1000],
  [{ step: { kind: "idle" }, cursor: { phase: "travel", target: REASON, at: [0.3, 0.5] } }, 650],
  [{ step: { kind: "idle" }, cursor: ON_REASON }, 250],
  [{ step: { kind: "idle" }, cursor: { ...ON_REASON, phase: "press" } }, 140],
  [{ step: { kind: "focus" }, cursor: ON_REASON }, 650],
  ...Array.from({ length: CHARS }, (_, i) => [{ step: { kind: "typing", typed: i + 1 }, cursor: ON_REASON }, 55] as const),
  [{ step: { kind: "typed" }, cursor: ON_REASON }, 350],
  [{ step: { kind: "typed" }, cursor: { phase: "travel", target: APPROVE } }, 650],
  [{ step: { kind: "hover" }, cursor: ON_APPROVE }, 450],
  [{ step: { kind: "press" }, cursor: { ...ON_APPROVE, phase: "press" } }, 180],
  [{ step: { kind: "busy" }, cursor: ON_APPROVE }, 450],
  [{ step: { kind: "approved" }, cursor: ON_APPROVE }, 900],
  [{ step: { kind: "approved" }, cursor: AWAY }, 1600],
];

/** Reduced motion holds the decision record: the outcome, with the facts one step back. */
const STILL: Frame = { step: { kind: "approved" }, cursor: { phase: "off" } };

export default function RepApproveLoop({ marked = false }: { marked?: boolean }) {
  const { ref, state, playing, setPlaying, reduced } = useLoop(STEPS, STILL);
  const stage = useRef<HTMLDivElement>(null);
  return (
    <LoopFrame
      frameRef={ref}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      reduced={reduced}
      className="jp-well--rep"
      description={`The rep's decision panel for ${REP_ORDER.account}, ${REP_ORDER.so}: over the limit by ${REP_ORDER.over}, ${REP_ORDER.order} order and ${REP_ORDER.creditLeft} credit left, last 12 invoices on time, within policy. The rep types the reason ${REP_ORDER.reason}, keeps Standard, presses Approve, and the panel shows the decision record.`}
    >
      <div ref={stage} className={`jp jp-scale jp-scale--rep${marked ? " is-marked" : ""}`}>
        <RepDecisionPanel step={state.step} marked={marked} />
        <DemoCursor stage={stage} cue={reduced ? { phase: "off" } : state.cursor} away={[0.7, 1.03]} />
      </div>
    </LoopFrame>
  );
}
