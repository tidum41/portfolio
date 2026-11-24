"use client";

/* Depth r3: a 3-way compare of how the reader reaches depth on the delivery-date answer.
   1. P10 / round 16 picker: a mode switch (Insight, Chart, People) before asking, like Dovetail Fast / Deep.
   2. After the answer lands, a control in the composer picks which insight to open (Friday readers or top asks),
      and that point expands in place with the same depth steps as D.
   3. D as it is: click a dotted underline in the answer.
   Approved parts and --dp tokens only. Hearthside mock data (MOCK-DATA.md). No Lucide. */
import { useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, TOP_ASKS, remainingCount } from "@/lib/dialogue/product/sampleData";
import DeliveryDateTrial, { Answer, CLOSED, type TrialState } from "@/components/dialogue/live/DeliveryDateTrial";

const QUESTION = "How do shoppers read \u2018Arrives by Friday\u2019?";
const TOTAL = 300;
const FRIDAY = 225;
const ASKS_SHOWN = 2;
const COUNT_ONLY = { finding: "", total: TOTAL, groups: [{ label: "Read it as this Friday", value: FRIDAY, focal: true }, { label: "Unsure", value: TOTAL - FRIDAY }] };
const ANA = QUOTE_LIST_FRIDAY[0];
const LEVELS = ["Insight", "Chart", "People"] as const;

function Panel({ children, footer, mark }: { children: ReactNode; footer?: ReactNode; mark: string }) {
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`} data-compare={mark}>
      <div className="dlg-trial__body">{children}</div>
      {footer}
    </div>
  );
}

function AsksChart() {
  return (
    <>
      <ChartVizCard>
        <div className="dlg-answer--rows">
          <ChartBarList max={TOP_ASKS[0].value} rows={TOP_ASKS.slice(0, ASKS_SHOWN).map((a, i) => ({ label: a.label, value: a.value, display: `${a.value} of ${TOTAL}`, focal: i === 0 }))} />
        </div>
      </ChartVizCard>
      <p className="dlg-trial__more">{TOP_ASKS.length - ASKS_SHOWN} more asks</p>
    </>
  );
}

function PickerTake() {
  const [pick, setPick] = useState(0);
  const [asked, setAsked] = useState(false);
  const [clip, setClip] = useState(false);
  const send = () => { setAsked(true); setClip(false); };
  const reset = () => { setAsked(false); setClip(false); };
  const state = !asked ? "start" : pick === 0 ? "insight" : pick === 1 ? "chart" : clip ? "people-source" : "people";
  const footer = (
    <div className="dp-study-chat__composer">
      <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
        {LEVELS.map((l, i) => (
          <button key={l} type="button" role="radio" aria-checked={pick === i} aria-pressed={pick === i} data-target={`depth-${i}`} className="dlg-depth__opt" disabled={asked} onClick={() => setPick(i)}>{l}</button>
        ))}
      </div>
      <div className="dp-study-chat__composer-box">
        {asked ? <p className="dp-study-chat__composer-placeholder">{dialogueCopy.composerPlaceholder}</p> : <p className="dp-study-chat__composer-text">{QUESTION}</p>}
        <button type="button" className="dp-study-chat__composer-send dlg-live__send" data-target="send" data-ready={asked ? undefined : ""} aria-label="Send" disabled={asked} onClick={send}>
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
  return (
    <div className="dlg-trial" data-mode="live" data-state={state} data-asked={asked ? "true" : "false"} data-pick={LEVELS[pick].toLowerCase()}>
      <Panel mark="picker" footer={footer}>
        {asked ? (
          <>
            <UserMessageBubble>{QUESTION}</UserMessageBubble>
            <p className="dlg-trial__line">{FRIDAY} of {TOTAL} shoppers read it as this Friday.</p>
            {pick >= 1 ? <AnswerCard still sideOpen="friday" answer={COUNT_ONLY} /> : null}
            {pick >= 2 ? (
              <>
                <div className="dp-clip-quotes">
                  <QuoteRow q={ANA} open={clip} onTap={() => setClip((c) => !c)} playSec={4} transcript={ANA_TRANSCRIPT} />
                </div>
                <p className="dlg-trial__more">+{remainingCount(FRIDAY, 1)} more who read it as this Friday</p>
              </>
            ) : null}
            <p className="dlg-trial__line">The top ask is an exact date.</p>
            {pick >= 1 ? <AsksChart /> : null}
            <button type="button" className="dlg-live__reset dlgv-reset" data-target="ask-again" onClick={reset}>Ask again</button>
          </>
        ) : null}
      </Panel>
    </div>
  );
}

function ComposerTake() {
  const [state, setState] = useState<TrialState>(CLOSED);
  const pick = (k: "count" | "asks") => {
    setState((s) => {
      if (k === "count") {
        const on = !s.count;
        return { count: on, clip: on ? s.clip : false, asks: false };
      }
      return { count: false, clip: false, asks: !s.asks };
    });
  };
  const label = state.clip ? "source" : state.count ? "friday" : state.asks ? "asks" : "closed";
  const footer = (
    <div className="dp-study-chat__composer">
      <div className="dlg-depth" role="radiogroup" aria-label="Open an insight">
        <button type="button" role="radio" className="dlg-depth__opt" aria-checked={state.count} data-target="insight-friday" onClick={() => pick("count")}>Friday readers</button>
        <button type="button" role="radio" className="dlg-depth__opt" aria-checked={state.asks} data-target="insight-asks" onClick={() => pick("asks")}>Top asks</button>
      </div>
    </div>
  );
  return (
    <div className="dlg-trial" data-mode="live" data-compare="composer" data-state={label}>
      <Answer state={state} set={setState} points={false} footer={footer} />
    </div>
  );
}

export default function DepthCompare() {
  return (
    <section className="dlgv-compare" data-pair="compare">
      <div className="dlgv-col">
        <p className="dlgv-label">1. Depth picker before asking (P10, round 16)</p>
        <PickerTake />
      </div>
      <div className="dlgv-col">
        <p className="dlgv-label">2. After the answer, pick an insight in the composer</p>
        <ComposerTake />
      </div>
      <div className="dlgv-col">
        <p className="dlgv-label">3. D, click a point in the answer</p>
        <div data-compare="d"><DeliveryDateTrial stepped={false} /></div>
      </div>
    </section>
  );
}
