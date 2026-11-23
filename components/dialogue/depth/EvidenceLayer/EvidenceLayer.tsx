"use client";

/* Dev only, awaiting Mudit's OK (exploration 1, design/dialogue-explorations/ex1-evidence-layer.md).
   Opening a side of the count shows its people. Three spatial models for where they go, and three
   lifts for how the layer arrives. The count bar is the shipped AnswerCard, untouched. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import SourcePill from "@/components/dialogue/product/SourcePill";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { DialogueInterviewPlayer } from "@/components/dialogue/DialogueInterviewPlayer";
import "./evidence-layer.css";

/** layer: people rise one elevation step over the answer, the bar stays put. flow: people grow below and the
 *  panel scrolls so the bar holds the top. header: the answer cuts to its bar alone and people take the body. */
export type EvidenceLayerOption = "layer" | "flow" | "header";
/** How the layer arrives (option layer only). rise: 8px up with the shadow step. reveal: unclips down from the
 *  bar. shadow: appears in place and only its shadow deepens. */
export type EvidenceLift = "rise" | "reveal" | "shadow";
export type EvidenceSide = "friday" | "unsure";
export type EvidencePerson = { name: string; time: string; end: string; quote: string };
/** Exploration 4: how the clip (the deepest level) is born under the tapped person. zoom: expands from the row.
 *  cut: lands at once, with a path line (225, then the person). grow: the shipped Grow, height opens under the row. */
export type ClipMotion = "zoom" | "cut" | "grow";
export type ClipControl = { person: string | null; onPerson: (name: string | null) => void; motion: ClipMotion };
export type EvidenceSideData = { label: string; count: number; people: readonly EvidencePerson[] };

type Props = {
  option: EvidenceLayerOption;
  lift?: EvidenceLift;
  /** The question the answer replies to, shown as the user bubble above it. */
  question: string;
  finding: string;
  total: number;
  sides: Readonly<Record<EvidenceSide, EvidenceSideData>>;
  open: EvidenceSide | null;
  onOpen: (side: EvidenceSide | null) => void;
  /** Exploration 4. Omit for exploration 1 (rows do not open clips). */
  clip?: ClipControl;
};

function Clip({ p, motion, sideways }: { p: EvidencePerson; motion: ClipMotion; sideways: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  /* Bring the tapped person to the top of the layer, so the clip is in view and the bar above never moves. */
  useEffect(() => {
    const el = ref.current;
    const sheet = el?.closest<HTMLElement>(".dlg-dx-ev__sheet");
    const entry = el?.closest<HTMLElement>(".dlg-dx-ev__entry");
    if (!sheet || !entry) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = entry.getBoundingClientRect().top - sheet.getBoundingClientRect().top + sheet.scrollTop - 12;
    sheet.scrollTo({ top, behavior: reduce || sideways || motion === "cut" ? "auto" : "smooth" });
  }, [p.name, motion, sideways]);
  const player = (
    <div ref={ref} className="dlg-dx-ev__clip" data-motion={motion} data-sideways={sideways ? "true" : "false"}>
      <DialogueInterviewPlayer start={p.time} current={p.time} total={p.end} />
    </div>
  );
  /* Sideways (one person to another) never animates, whatever the deeper motion is. */
  if (motion === "grow" && !sideways) return <Grow open className="dlg-grow--gap">{player}</Grow>;
  return player;
}

function People({ side, data, clip, sideways }: { side: EvidenceSide; data: EvidenceSideData; clip?: ClipControl; sideways: boolean }) {
  const active = clip?.person ?? null;
  return (
    <div className="dlg-dx-ev__people" data-side={side}>
      <p className="dlg-dx-ev__head">
        <span className="dlg-dx-ev__swatch" data-tone={side === "friday" ? "focal" : "mid"} aria-hidden />
        <span className="dlg-dx-ev__head-label">{data.label}</span>
        <span className="dlg-dx-ev__head-count">{data.count}</span>
      </p>
      {clip?.motion === "cut" && active ? (
        <p className="dlg-dx-ev__path">{data.count} · {active} {data.people.find((q) => q.name === active)?.time}</p>
      ) : null}
      <div className="dp-clip-quotes">
        {data.people.map((q) => (
          <div key={q.name} className="dlg-dx-ev__entry">
            <div
              className="dp-clip-quote dlg-dx-ev__row"
              tabIndex={0}
              role={clip ? "button" : undefined}
              aria-expanded={clip ? active === q.name : undefined}
              data-selected={active === q.name ? "true" : undefined}
              onClick={clip ? () => clip.onPerson(active === q.name ? null : q.name) : undefined}
              onKeyDown={clip ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clip.onPerson(active === q.name ? null : q.name); } } : undefined}
            >
              <p className="dp-clip-quote__who"><WaveformIcon className="dp-clip-quote__icon" /><span className="dp-clip-quote__name">{q.name}</span><span className="dp-clip-quote__time">{q.time}</span></p>
              <p className="dp-clip-quote__text">{q.quote}</p>
            </div>
            {clip && active === q.name ? <Clip p={q} motion={clip.motion} sideways={sideways} /> : null}
          </div>
        ))}
      </div>
      <div className="dp-sources"><SourcePill name={`+${data.count - data.people.length} more`} time="" /></div>
    </div>
  );
}

export default function EvidenceLayer({ option, lift = "rise", question, finding, total, sides, open, onOpen, clip }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  /* The sheet keeps the last side while it leaves, so it never empties mid-exit. */
  const [last, setLast] = useState<EvidenceSide>(open ?? "friday");
  if (open && open !== last) setLast(open);
  const side = open ?? last;
  /* A clip that replaces another open clip is a sideways move: it lands with no motion. */
  const person = clip?.person ?? null;
  const [lastPerson, setLastPerson] = useState<string | null>(person);
  const [sideways, setSideways] = useState(false);
  if (person !== lastPerson) {
    setSideways(lastPerson !== null && person !== null);
    setLastPerson(person);
  }

  /* layer: pin the sheet just under the bar. flow: scroll so the bar holds the top. */
  useLayoutEffect(() => {
    const vp = viewport.current;
    const bar = vp?.querySelector<HTMLElement>(".dlg-live__bar");
    if (!vp || !bar) return;
    const top = bar.getBoundingClientRect().bottom - vp.getBoundingClientRect().top + vp.scrollTop;
    vp.style.setProperty("--dlg-dx-ev-top", `${Math.round(top)}px`);
    if (option !== "flow") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const barTop = bar.getBoundingClientRect().top - vp.getBoundingClientRect().top + vp.scrollTop;
    vp.scrollTo({ top: open ? Math.max(0, barTop - 8) : 0, behavior: reduce ? "auto" : "smooth" });
  }, [open, option]);

  const groups = [
    { label: sides.friday.label, value: sides.friday.count, focal: true },
    { label: sides.unsure.label, value: sides.unsure.count },
  ];
  const title = option === "header" && open ? "" : finding;
  const toggle = (w: EvidenceSide) => onOpen(open === w ? null : w);

  return (
    <div className="dialogue-product-root dlg-dx-ev" data-option={option} data-lift={lift} data-open={open ?? "none"}>
      <div ref={viewport} className="dlg-dx-ev__viewport">
        <UserMessageBubble>{question}</UserMessageBubble>
        <div className="dlg-dx-ev__answer">
          <AnswerCard still answer={{ finding: title, total, groups }} sideOpen={open ?? false} onSide={toggle} />
        </div>
        {option === "flow" ? (
          <Grow open={!!open} className="dlg-grow--gap"><People side={side} data={sides[side]} clip={clip} sideways={sideways} /></Grow>
        ) : (
          <div className="dlg-dx-ev__sheet" data-shown={open ? "true" : "false"} aria-hidden={!open}>
            <People side={side} data={sides[side]} clip={clip} sideways={sideways} />
          </div>
        )}
      </div>
    </div>
  );
}
