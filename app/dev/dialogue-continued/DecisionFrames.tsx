"use client";

/* Decision frames (?frame=1|2, dev only): two takes side by side at 390, with one draft line under the pair.
   Every px value in the line is measured live from the two columns. */
import { useLayoutEffect, useRef, useState } from "react";
import HybridPanel from "./HybridPanel";
import { HYBRID_LABELS, type HybridOpt, type HybridState } from "./hybridModel";

const FRAMES: Record<"1" | "2", { a: HybridOpt; b: HybridOpt; state: HybridState }> = {
  "1": { a: "h", b: "h1", state: "typed" },
  "2": { a: "h", b: "h2", state: "landed" },
};

const heightOf = (el: Element) => Math.round(el.getBoundingClientRect().height);

/* Reads one column, stores each value on it as a data attribute, and returns what it read. */
function readColumn(frame: "1" | "2", column: HTMLElement): Record<string, string> {
  const values: Record<string, string> = {};
  if (frame === "1") {
    const box = column.querySelector(".dp-study-chat__composer-box");
    if (box) values.composerH = String(heightOf(box));
    values.scopeShown = String(!!column.querySelector('[data-spot="composer-scope"]'));
  } else {
    const reply1 = column.querySelector(".dlgh-reply1");
    const row = column.querySelector('[data-spot="reply2"] .dlgh-row');
    if (reply1) values.foldH = String(heightOf(reply1));
    if (reply1 && row) values.reach = String(Math.round(row.getBoundingClientRect().bottom - reply1.getBoundingClientRect().top));
  }
  Object.assign(column.dataset, values);
  return values;
}

export default function DecisionFrames({ frame }: { frame: "1" | "2" }) {
  const { a, b, state } = FRAMES[frame];
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const [fold, setFold] = useState<{ a: number; b: number } | null>(null);
  const [composerRead, setComposerRead] = useState(false);

  useLayoutEffect(() => {
    const columns = [left.current, right.current].filter((el): el is HTMLDivElement => !!el);
    if (columns.length !== 2) return;
    let log: ReturnType<typeof setTimeout> | undefined;
    let logged = false;
    const measure = () => {
      const read = columns.map((column) => readColumn(frame, column));
      const [first, second] = read.map((v) => (v.foldH === undefined ? null : Number(v.foldH)));
      if (first !== null && second !== null) setFold((cur) => (cur && cur.a === first && cur.b === second ? cur : { a: first, b: second }));
      if (read.every((v) => v.composerH !== undefined)) setComposerRead(true);
      /* Logged once, after the sizes have held still, so an easing composer row is not reported midway. */
      if (logged) return;
      clearTimeout(log);
      log = setTimeout(() => { logged = true; console.info(`frame ${frame}`, { [a]: read[0], [b]: read[1] }); }, 600);
    };
    const observer = new ResizeObserver(measure);
    columns.forEach((column) => {
      observer.observe(column);
      column.querySelectorAll(".dp-study-chat__composer-box, .dlgh-reply1").forEach((el) => observer.observe(el));
    });
    return () => { observer.disconnect(); clearTimeout(log); };
  }, [frame, a, b]);

  let draft = "Draft: measuring";
  if (frame === "1" && composerRead) draft = "Draft: The hybrid shows the 225 in the composer before you send, and alternative 1 waits for reply 2 to name it.";
  if (frame === "2" && fold) draft = `Draft: Reply 1 takes ${fold.a} px as one line and ${fold.b} px with the bar, ${fold.b - fold.a} px more for the 225 against the 75.`;

  return (
    <div className="dlg-frames">
      <div className="dlg-frames__row">
        <div className="dlg-frame" ref={left}><p className="dlg-cont-label">{HYBRID_LABELS[a]}</p><HybridPanel opt={a} state={state} /></div>
        <div className="dlg-frame" ref={right}><p className="dlg-cont-label">{HYBRID_LABELS[b]}</p><HybridPanel opt={b} state={state} /></div>
      </div>
      <p className="dlg-frames__draft">{draft}</p>
    </div>
  );
}
