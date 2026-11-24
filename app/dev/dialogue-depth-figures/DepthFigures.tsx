"use client";

/* Depth r4, item 4 (dev only, never imported on /dialogue): annotated figures for the depth iteration. One point per
   figure, in the case study's figure craft: the warm well (DialogueRachelFrame, no inset border), real product parts, a
   one-line caption under the well. Callouts reuse the take's gutter note (.dlg-note: small muted text and a thin leader
   from the panel edge, never over the product UI); pair figures name each side in the same small muted text above its
   panel. Phones drop the gutter notes and keep the caption, as the takes do (P16 round 3). Copy is a proposal. */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import DialogueRachelFrame from "@/components/dialogue/DialogueRachelFrame";
import { MenuTake, PointTake } from "../dialogue-variants/DepthCompare";
import FourFindings from "./FourFindings";
import "@/components/dialogue/product/dialogue-product.css";
import "../dialogue-variants/variants.css";
import "./figures.css";

type Note = { sel: string; text: string };

/** Gutter notes placed at the vertical centre of their targets, re-measured whenever the stage resizes. */
function Notes({ notes }: { notes: Note[] }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [ys, setYs] = useState<number[]>([]);
  useLayoutEffect(() => {
    // The stage is the anchor's parent; a parent's own ref is not attached yet when a child's layout effect runs.
    const el = anchor.current?.parentElement;
    if (!el) return;
    const measure = () => {
      const top = el.getBoundingClientRect().top;
      setYs(notes.map((n) => {
        const t = el.querySelector(n.sel);
        if (!t) return -1;
        const r = t.getBoundingClientRect();
        return Math.round(r.top - top + r.height / 2);
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll(".dlg-trial__panel").forEach((p) => ro.observe(p));
    return () => ro.disconnect();
  }, [notes]);
  return (
    <>
      <span ref={anchor} hidden />
      {notes.map((n, i) => (ys[i] ?? -1) < 0 ? null : (
        <p key={n.text} className="dlg-note dlgf-note" data-on="" style={{ ["--y" as string]: `${ys[i]}px` }}>
          <span className="dlg-note__line" aria-hidden />
          <span className="dlg-note__text">{n.text}</span>
        </p>
      ))}
    </>
  );
}

function Figure({ id, point, caption, children }: { id: string; point: string; caption: string; children: ReactNode }) {
  return (
    <section className="dlgf-fig" data-fig={id}>
      <p className="dlgf-point">{point}</p>
      <figure className="cs-figure dialogue-live-block dlgf-figure">
        <DialogueRachelFrame tone="solution">{children}</DialogueRachelFrame>
      </figure>
      <p className="dialogue-caption cs-caption"><span className="dialogue-caption__sentence">{caption}</span></p>
    </section>
  );
}

function Side({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dlgf-side">
      <p className="dlgf-side__label dlg-note__text">{label}</p>
      {children}
    </div>
  );
}

const CLICK_NOTES: Note[] = [
  { sel: '[data-target="trial-count"]', text: "1. Click the count" },
  { sel: '[data-target="quote-ana"] .dp-clip-quote__who', text: "2. Click Ana’s quote" },
  { sel: ".dlg-live__clip", text: "Her clip opens under the count" },
];

function ClicksFigure() {
  return (
    <Figure id="clicks" point="Figure 2. Clicks to the source" caption="Two clicks from the sentence to Ana&rsquo;s clip, with the count still on screen. Illustrative data.">
      <div className="dlgf-stage">
        <div className="dlgf-panel"><PointTake beat="source" /></div>
        <Notes notes={CLICK_NOTES} />
      </div>
    </Figure>
  );
}

export default function DepthFigures({ only }: { only?: string }) {
  const show = (id: string) => !only || only === id;
  return (
    <main className="dialogue-case-study dlgf-page" data-theme-scope="light">
      <header className="dlgf-head">
        <h1 className="dlgf-title">Level of depth for each reply: annotated figures</h1>
        <p className="dlgf-sub">Dev only. One point per figure, built from the live parts. Captions and notes are proposals.</p>
      </header>
      {show("when") ? (
        <Figure id="when" point="Figure 1. When you choose depth" caption="Left, depth is picked before the reply. Right, after it. Illustrative data.">
          <div className="dlgf-pair">
            <Side label="Picked before the reply"><MenuTake beat="ask" menuOpen /></Side>
            <Side label="Picked after the reply"><PointTake beat="reply" /></Side>
          </div>
        </Figure>
      ) : null}
      {show("clicks") ? <ClicksFigure /> : null}
      {show("four") ? (
        <Figure id="four" point="Figure 3. What happens at four findings" caption="At four findings a picked depth opens all four, and points open one. Illustrative data.">
          <div className="dlgf-pair">
            <Side label="People, picked before asking"><FourFindings all /></Side>
            <Side label="Points, closed until clicked"><FourFindings /></Side>
          </div>
        </Figure>
      ) : null}
    </main>
  );
}
