"use client";

import LoopFrame from "./LoopFrame";
import RepDecisionPanel, { type RepStep } from "./RepDecisionPanel";
import { useLoop } from "./useLoop";
import { REP_ORDER } from "./data";

const CHARS = REP_ORDER.reason.length;

/**
 * About 6.5s, in the prototype's own states: the facts hold, the Reason field takes focus and
 * lists the quick reasons, the rep types Paid on time, the pointer is over Approve (hover
 * fill), it presses (scale 0.97), the button shows Approving, and the decision record holds.
 */
const STEPS: readonly (readonly [RepStep, number])[] = [
  [{ kind: "idle" }, 1200],
  [{ kind: "focus" }, 650],
  ...Array.from({ length: CHARS }, (_, i) => [{ kind: "typing", typed: i + 1 }, 55] as const),
  [{ kind: "typed" }, 500],
  [{ kind: "hover" }, 600],
  [{ kind: "press" }, 200],
  [{ kind: "busy" }, 450],
  [{ kind: "approved" }, 2400],
];

/** Reduced motion holds the decision record: the outcome, with the facts one step back. */
const STILL: RepStep = { kind: "approved" };

export default function RepApproveLoop({ marked = false }: { marked?: boolean }) {
  const { ref, state, playing, setPlaying, reduced } = useLoop(STEPS, STILL);
  return (
    <LoopFrame
      frameRef={ref}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      reduced={reduced}
      className="jp-well--rep"
      description={`The rep's decision panel for ${REP_ORDER.account}, ${REP_ORDER.so}: over the limit by ${REP_ORDER.over}, ${REP_ORDER.order} order and ${REP_ORDER.creditLeft} credit left, last 12 invoices on time, within policy. The rep types the reason ${REP_ORDER.reason}, keeps Standard, presses Approve, and the panel shows the decision record.`}
    >
      <div className={`jp jp-scale jp-scale--rep${marked ? " is-marked" : ""}`}>
        <RepDecisionPanel step={state} marked={marked} />
      </div>
    </LoopFrame>
  );
}
