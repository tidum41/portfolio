"use client";

import { useRef } from "react";
import DemoCursor, { type CursorCue } from "./DemoCursor";
import ImportRows, { type ButtonLook } from "./ImportRows";
import LoopFrame from "./LoopFrame";
import { useLoop } from "./useLoop";
import { ROW_16, ROW_17, ROW_18, ROW_20, ROW_22 } from "./data";
import type { Resolution } from "./data";

type State = { look: ButtonLook; resolution: Resolution; cursor: CursorCue };

const CHANGE = ".is-decision .jp-btn--outline";
const AWAY: CursorCue = { phase: "away" };
const TO_CHANGE: CursorCue = { phase: "travel", target: CHANGE };
const ON_CHANGE: CursorCue = { phase: "over", target: CHANGE };
const PRESS_CHANGE: CursorCue = { phase: "press", target: CHANGE };

/**
 * About 5s, like a screen recording. The question holds while the pointer rests, the pointer
 * eases to Change to 36, the button takes the prototype's hover fill as the pointer turns into a
 * hand, it presses (the button's scale 0.97 and a short press of the pointer), and the row turns
 * Ready at 36 the way the prototype swaps it. The pointer moves off and the row holds.
 */
const STEPS: readonly (readonly [State, number])[] = [
  [{ look: "rest", resolution: "open", cursor: AWAY }, 1100],
  [{ look: "rest", resolution: "open", cursor: TO_CHANGE }, 650],
  [{ look: "hover", resolution: "open", cursor: ON_CHANGE }, 550],
  [{ look: "press", resolution: "open", cursor: PRESS_CHANGE }, 180],
  [{ look: "rest", resolution: "changed", cursor: { ...ON_CHANGE, shape: "arrow" } }, 700],
  [{ look: "rest", resolution: "changed", cursor: AWAY }, 1700],
];

const ROWS = [ROW_16, ROW_17, ROW_18, ROW_20, ROW_22] as const;

/**
 * Hero and import loop: rows 16 to 22 of Maya's import, rendered from the ported prototype grid.
 * The well and the grid keep the same size in every state, so nothing on the page moves.
 */
export default function ChangeQuantityLoop({ size = "hero" }: { size?: "hero" | "inline" }) {
  const { ref, state, playing, setPlaying, reduced } = useLoop(STEPS, STEPS[0][0]);
  const stage = useRef<HTMLDivElement>(null);
  return (
    <LoopFrame
      frameRef={ref}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      reduced={reduced}
      className={`jp-well--${size}`}
      description="Rows 16 to 22 of Maya's import. Row 18, 360 Scorpeus paddles, says Usually 36, check quantity. Change to 36 is pressed and the row turns Ready at 36."
    >
      <div ref={stage} className={`jp jp-scale jp-scale--${size}`}>
        <div className="jp-card">
          <ImportRows rows={ROWS} resolution={state.resolution} look={state.look} label="Rows 16 to 22 of Maya's import" />
        </div>
        <DemoCursor stage={stage} cue={reduced ? { phase: "off" } : state.cursor} />
      </div>
    </LoopFrame>
  );
}
