"use client";

import ImportRows, { type ButtonLook } from "./ImportRows";
import LoopFrame from "./LoopFrame";
import { useLoop } from "./useLoop";
import { ROW_16, ROW_17, ROW_18, ROW_20, ROW_22 } from "./data";
import type { Resolution } from "./data";

type State = { look: ButtonLook; resolution: Resolution };

/**
 * About 4.5s. The question holds for a beat, the pointer is over Change to 36 (the prototype's
 * hover fill), it presses (scale 0.97), and the row turns Ready at 36 the way the prototype
 * swaps it, with no transition. Then the row holds, and the loop starts over.
 */
const STEPS: readonly (readonly [State, number])[] = [
  [{ look: "rest", resolution: "open" }, 1500],
  [{ look: "hover", resolution: "open" }, 700],
  [{ look: "press", resolution: "open" }, 250],
  [{ look: "rest", resolution: "changed" }, 1800],
];

const ROWS = [ROW_16, ROW_17, ROW_18, ROW_20, ROW_22] as const;

/**
 * Hero and import loop: rows 16 to 22 of Maya's import, rendered from the ported prototype grid.
 * The well and the grid keep the same size in every state, so nothing on the page moves.
 */
export default function ChangeQuantityLoop({ size = "hero" }: { size?: "hero" | "inline" }) {
  const { ref, state, playing, setPlaying, reduced } = useLoop(STEPS, STEPS[0][0]);
  return (
    <LoopFrame
      frameRef={ref}
      playing={playing}
      onToggle={() => setPlaying((p) => !p)}
      reduced={reduced}
      className={`jp-well--${size}`}
      description="Rows 16 to 22 of Maya's import. Row 18, 360 Scorpeus paddles, says Usually 36, check quantity. Change to 36 is pressed and the row turns Ready at 36."
    >
      <div className={`jp jp-scale jp-scale--${size}`}>
        <div className="jp-card">
          <ImportRows rows={ROWS} resolution={state.resolution} look={state.look} label="Rows 16 to 22 of Maya's import" />
        </div>
      </div>
    </LoopFrame>
  );
}
