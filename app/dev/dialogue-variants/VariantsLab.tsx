"use client";

/* Depth r1: the delivery-date answer redesigned. Same question and Hearthside facts as the Problem still (MOCK-DATA 4c to 4g).
   Built only from approved parts: ChartVizCard, ChartStackedBar (via AnswerCard), ChartBarList, QuoteRow, the in-place clip. */
import { useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { DialogueDemoStill } from "@/components/dialogue/motion/DialogueDemoVideo";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ANA_TRANSCRIPT, QUOTE_LIST, QUOTE_LIST_FRIDAY, remainingCount } from "@/lib/dialogue/product/sampleData";
import "./variants.css";

const QUESTION = "How do shoppers read \u2018Arrives by Friday\u2019?";
const ASKS = [
  { label: "Show an exact calendar date", value: 41 },
  { label: "Say which Friday it means", value: 28 },
  { label: "Warn when Friday slips", value: 17 },
  { label: "Offer a pickup option", value: 11 },
  { label: "Email the day before", value: 8 },
];
const askRows = (n: number) => ASKS.slice(0, n).map((a, i) => ({ ...a, display: `${a.value} of 300`, focal: i === 0 }));
const [ANA, DEV] = QUOTE_LIST_FRIDAY;
const MEI = QUOTE_LIST[0];
/** The count opened under its own sentence: no repeated title. */
const COUNT_ONLY = { finding: "", total: 300, groups: [{ label: "Read it as this Friday", value: 225, focal: true }, { label: "Unsure", value: 75 }] };

function Panel({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="dlgv-col">
      {label ? <p className="dlgv-label">{label}</p> : null}
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlgv-panel ${dialogueProductFontClassName}`}>
        <div className="dlgv-body">{children}</div>
      </div>
    </div>
  );
}

function Before() {
  return (
    <div className="dlgv-col">
      <p className="dlgv-label">Shipped anatomy (before)</p>
      <div className="dlgv-before"><DialogueDemoStill src="/dialogue/motion/variant-before-full.jpg" live={{ demo: "before", still: "final" }} label="The shipped answer anatomy" /></div>
    </div>
  );
}

function H({ children }: { children: ReactNode }) {
  return <p className="dlgv-h">{children}</p>;
}

/** A: the shipped answer's own headings and quotes, each section given its native form. */
function VariantA() {
  return (
    <Panel label="A. Same words, restructured">
      <UserMessageBubble>{QUESTION}</UserMessageBubble>
      <AnswerCard still />
      <H>{"\u{1F4CB} What shoppers asked for after checkout"}</H>
      <ChartVizCard><div className="dlg-answer--rows"><ChartBarList rows={askRows(5)} max={41} /></div></ChartVizCard>
      <H>{"\u{1F4AC} In their words"}</H>
      <div className="dp-clip-quotes">
        {[ANA, DEV, MEI].map((q) => <QuoteRow key={q.participant} q={q} open={false} />)}
      </div>
    </Panel>
  );
}

/** B: the picture leads; the words shrink to the count title and one quote. */
function VariantB() {
  const restAsks = ASKS.length - 2;
  return (
    <Panel label="B. Fewer words, the visual leads">
      <UserMessageBubble>{QUESTION}</UserMessageBubble>
      <AnswerCard still />
      <ChartVizCard title="The top ask is an exact date.">
        <div className="dlg-answer--rows"><ChartBarList rows={askRows(2)} max={41} /></div>
        <p className="dlgv-more">{restAsks} more asks</p>
      </ChartVizCard>
      <div className="dp-clip-quotes"><QuoteRow q={ANA} open={false} /></div>
      <p className="dlgv-more">+{remainingCount(225, 1)} more who read it as this Friday</p>
    </Panel>
  );
}

/** C: click to expand in place. Any point in the answer opens more on that same point, under it, ending at the source clip. */
function VariantC() {
  const [step, setStep] = useState(0);
  const lead = (
    <p className="dlgv-lead">
      <button type="button" className="dlgv-point" data-target="c-count" aria-expanded={step > 0} onClick={() => setStep(step > 0 ? 0 : 1)}>
        225 of 300 shoppers
      </button>{" "}read &lsquo;Arrives by Friday&rsquo; as this Friday, whatever day they ordered.
    </p>
  );
  return (
    <Panel label="C. One click opens the same point, down to the source">
      <UserMessageBubble>{QUESTION}</UserMessageBubble>
      {lead}
      {step > 0 ? (
        <div className="dlgv-open">
          <AnswerCard still sideOpen="friday" answer={COUNT_ONLY} />
          <div className="dp-clip-quotes">
            <QuoteRow q={ANA} open={step > 1} onTap={() => setStep(step > 1 ? 1 : 2)} playSec={4} transcript={ANA_TRANSCRIPT} />
            <QuoteRow q={DEV} open={false} />
          </div>
          <p className="dlgv-more">+{remainingCount(225, 2)} more who read it as this Friday</p>
        </div>
      ) : null}
    </Panel>
  );
}

export default function VariantsLab() {
  return (
    <main className="dlgv-page" data-theme-scope="light">
      <section className="dlgv-pair" data-pair="a"><Before /><VariantA /></section>
      <section className="dlgv-pair" data-pair="b"><Before /><VariantB /></section>
      <section className="dlgv-pair" data-pair="c"><Before /><VariantC /></section>
    </main>
  );
}
