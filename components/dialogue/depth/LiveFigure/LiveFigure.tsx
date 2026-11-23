"use client";

/* Dev only, awaiting Mudit's OK (exploration 5, design/dialogue-explorations/ex5-live-figure.md).
   One figure the reader can tap (225 and 75). The recorded take is the default and the fallback: no JavaScript,
   reduced motion (option ghost) and viewports under 360px get the video or its poster. */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import DialogueDemoVideo from "@/components/dialogue/motion/DialogueDemoVideo";
import EvidenceLayer, { type EvidenceSide, type EvidenceSideData } from "@/components/dialogue/depth/EvidenceLayer/EvidenceLayer";
import "./live-figure.css";

/** control: the take plays, and a container control on the well swaps in the live UI.
 *  ghost: the live UI is the default, and on first view a demo pointer taps 225 once, then hands over. */
export type LiveSignal = "control" | "ghost";
export type LiveTake = { src: string; poster: string; label: string };

type Props = {
  signal: LiveSignal;
  take: LiveTake;
  question: string;
  finding: string;
  total: number;
  sides: Readonly<Record<EvidenceSide, EvidenceSideData>>;
  /** Copy for the container control (option control). Dev-only proposals until Mudit writes them. */
  controlLabels: { live: string; take: string };
};

type Ghost = { x: number; y: number; phase: "hidden" | "enter" | "move" | "press" | "leave" };

const SMALL = "(max-width: 359px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

export default function LiveFigure({ signal, take, question, finding, total, sides, controlLabels }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [env, setEnv] = useState<{ small: boolean; reduce: boolean } | null>(null);
  const [chosenLive, setChosenLive] = useState(false);
  const [open, setOpen] = useState<EvidenceSide | null>(null);
  const [ghost, setGhost] = useState<Ghost>({ x: 0, y: 0, phase: "hidden" });
  const touched = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setEnv({ small: matchMedia(SMALL).matches, reduce: matchMedia(REDUCE).matches }), 0);
    return () => clearTimeout(t);
  }, []);

  const canLive = env !== null && !env.small;
  const live = signal === "control" ? canLive && chosenLive : canLive && !env.reduce;

  /* ghost: once, on first view, a demo pointer taps 225, holds the open layer, closes it and leaves. */
  useEffect(() => {
    if (signal !== "ghost" || !live) return;
    const el = root.current;
    if (!el) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) => timers.push(setTimeout(() => { if (!touched.current) f(); }, ms));
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.intersectionRatio >= 0.6)) return;
      io.disconnect();
      const bar = el.querySelector<HTMLElement>(".dlg-live__bar .dp-chart-stack__seg, .dlg-live__bar");
      if (!bar) return;
      const r = el.getBoundingClientRect();
      const s = bar.getBoundingClientRect();
      /* Aim at the 225 segment itself (the hit area also covers the legend under it). */
      const tx = s.left - r.left + s.width * 0.5;
      const ty = s.top - r.top + Math.min(s.height, 24) * 0.5;
      at(600, () => setGhost({ x: tx + 60, y: ty + 90, phase: "enter" }));
      at(800, () => setGhost({ x: tx, y: ty, phase: "move" }));
      at(1400, () => { setGhost({ x: tx, y: ty, phase: "press" }); setOpen("friday"); });
      at(1600, () => setGhost({ x: tx, y: ty, phase: "move" }));
      at(3600, () => { setGhost({ x: tx, y: ty, phase: "press" }); setOpen(null); });
      at(3800, () => setGhost({ x: tx, y: ty, phase: "leave" }));
    }, { threshold: [0.6] });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [signal, live]);

  /* Any real touch ends the demo at once and hands the figure to the reader. */
  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    setGhost((g) => ({ ...g, phase: "hidden" }));
  };

  return (
    <div ref={root} className="dlg-dx-live" data-signal={signal} data-mode={live ? "live" : "take"} onPointerDownCapture={takeOver}>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="dlg-demo__video" src={take.poster} alt={take.label} />
      </noscript>
      {live ? (
        <div className="dlg-dx-live__stage">
          <EvidenceLayer option="layer" lift="rise" question={question} finding={finding} total={total} sides={sides} open={open} onOpen={(s) => { takeOver(); setOpen(s); }} />
        </div>
      ) : (
        <DialogueDemoVideo src={take.src} poster={take.poster} label={take.label} />
      )}
      {signal === "control" && canLive ? (
        <button type="button" className="dlg-dx-live__control" aria-pressed={chosenLive} onClick={() => { setChosenLive((v) => !v); setOpen(null); }}>
          {chosenLive ? controlLabels.take : controlLabels.live}
        </button>
      ) : null}
      {signal === "ghost" && ghost.phase !== "hidden" ? (
        <span className="dlg-dx-live__ghost" data-phase={ghost.phase} aria-hidden style={{ "--gx": `${ghost.x}px`, "--gy": `${ghost.y}px` } as CSSProperties} />
      ) : null}
    </div>
  );
}
