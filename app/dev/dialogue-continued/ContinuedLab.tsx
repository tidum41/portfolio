"use client";

/* Continued interaction after depth D: a second question lands on a thread where a point in reply 1 is (or was) open.
   Dev-only harness. Built from UserMessageBubble, AnswerCard, ChartVizCard, ChartBarList, QuoteRow, Grow, ChatComposer.
   Hearthside numbers only (MOCK-DATA). No new product components. */
import { useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChatComposer from "@/components/dialogue/product/ChatComposer";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, QUOTE_LIST_NEW, remainingCount } from "@/lib/dialogue/product/sampleData";
import { COUNT_ANSWER, FRIDAY, QUESTION, TOTAL } from "@/components/dialogue/live/DeliveryDateTrial";
import "./continued.css";

export const OPTS = ["a", "b", "c"] as const;
export type Opt = (typeof OPTS)[number];
export const PHASES = ["landed", "next"] as const;
export type Phase = (typeof PHASES)[number];

export const LABELS: Record<Opt, string> = {
  a: "Reply 1 folds back to its count, with a mark that it was opened.",
  b: "Reply 1 stays open, and reply 2 arrives at the overview.",
  c: "Reply 2 stays on the opened point, shown as a chip on the question.",
};

const Q2 = "Do new and repeat shoppers read \u2018Arrives by Friday\u2019 the same way?";
const Q2_SCOPED = "What do they say?";
const CHIP = "Friday readers";
const NEW_OF = 14;
const NEW = 9;
const REPEAT_OF = 125;
const REPEAT = 88;
const ANA = QUOTE_LIST_FRIDAY[0];
const KAI = QUOTE_LIST_NEW[0];
const GROUP_ROWS = [
  { label: "New shoppers", value: NEW / NEW_OF, display: `${NEW} of ${NEW_OF}`, focal: true },
  { label: "Repeat shoppers", value: REPEAT / REPEAT_OF, display: `${REPEAT} of ${REPEAT_OF}` },
];

type Thread = { r1: boolean; clip1: boolean; r2: boolean; clip2: boolean };

function initialThread(opt: Opt, phase: Phase): Thread {
  const r1 = opt === "b";
  const r2 = phase === "next" && opt !== "c" ? true : false;
  const clip2 = opt === "c" && phase === "next";
  return { r1, clip1: false, r2, clip2 };
}

function Point({ open, opened, target, onClick, children }: { open: boolean; opened?: boolean; target: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" className="dlg-trial__point" data-target={target} data-opened={opened || undefined} aria-expanded={open} onClick={onClick}>
      {children}
    </button>
  );
}

function Wrap({ open, children }: { open: boolean; children: ReactNode }) {
  return <Grow open={open} className="dlg-trial__open">{children}</Grow>;
}

function ThreadPanel({ opt, phase }: { opt: Opt; phase: Phase }) {
  const [t, setT] = useState<Thread>(() => initialThread(opt, phase));
  const set = (patch: Partial<Thread>) => setT((cur) => ({ ...cur, ...patch }));
  return (
    <div className="dlg-trial dlg-cont" data-mode="live" data-opt={opt} data-state={phase} data-r1={t.r1 ? "open" : "folded"} data-r2={t.r2 ? "open" : "closed"}>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
        <div className="dlg-trial__body">
          <UserMessageBubble>{QUESTION}</UserMessageBubble>
          <p className="dlg-trial__line">
            <Point open={t.r1} opened target="r1-count" onClick={() => set({ r1: !t.r1, clip1: t.r1 ? false : t.clip1 })}>{`${FRIDAY} of ${TOTAL} shoppers`}</Point>
            {" "}read it as this Friday.
          </p>
          <Wrap open={t.r1}>
            <AnswerCard still sideOpen="friday" answer={COUNT_ANSWER} />
            <div className="dp-clip-quotes">
              <QuoteRow q={ANA} open={t.clip1} onTap={() => set({ clip1: !t.clip1 })} playSec={4} transcript={ANA_TRANSCRIPT} />
            </div>
            <p className="dlg-trial__more">+{remainingCount(FRIDAY, 1)} more who read it as this Friday</p>
          </Wrap>
          {opt === "c" ? (
            <>
              <div className="dlg-cont__q">
                <span className="dp-chip dlg-cont__chip">{CHIP}</span>
                <UserMessageBubble>{Q2_SCOPED}</UserMessageBubble>
              </div>
              <p className="dlg-trial__line">
                <Point open={t.clip2} target="r2-ana" onClick={() => set({ clip2: !t.clip2 })}>{ANA.participant}</Point>
                {" "}said she planned for this Friday.
              </p>
              <Wrap open={true}>
                <div className="dp-clip-quotes">
                  <QuoteRow q={ANA} open={t.clip2} onTap={() => set({ clip2: !t.clip2 })} playSec={4} transcript={ANA_TRANSCRIPT} />
                </div>
                <p className="dlg-trial__more">+{remainingCount(FRIDAY, 1)} more who read it as this Friday</p>
              </Wrap>
            </>
          ) : (
            <>
              <UserMessageBubble>{Q2}</UserMessageBubble>
              <p className="dlg-trial__line">
                <Point open={t.r2} target="r2-new" onClick={() => set({ r2: !t.r2 })}>{`${NEW} of ${NEW_OF} new shoppers`}</Point>
                {" "}read it as this Friday, and {REPEAT} of {REPEAT_OF} repeat shoppers did.
              </p>
              <Wrap open={t.r2}>
                <ChartVizCard>
                  <div className="dlg-answer--rows">
                    <ChartBarList rows={GROUP_ROWS} max={1} />
                  </div>
                </ChartVizCard>
                <div className="dp-clip-quotes">
                  <QuoteRow q={KAI} open={false} />
                </div>
                <p className="dlg-trial__more">+{remainingCount(NEW_OF, 1)} more new shoppers</p>
              </Wrap>
            </>
          )}
        </div>
        <ChatComposer />
      </div>
    </div>
  );
}

const PHASE_LABEL: Record<Phase, string> = {
  landed: "Right after reply 2 lands",
  next: "A point in reply 2 is open",
};

export default function ContinuedLab({ opt, phase = "landed" }: { opt?: Opt; phase?: Phase }) {
  const [curPhase, setPhase] = useState<Phase>(phase);
  const shown: Opt[] = opt ? [opt] : [...OPTS];
  return (
    <div className="dlg-cont-page">
      <header className="dlg-cont-page__head">
        <h1 className="dlg-cont-page__title">Continued interaction</h1>
        <p className="dlg-cont-page__sub">{shown.length === 1
          ? "After a point is open in the first reply, a second question is asked. Hearthside illustrative data. Depth stays D: click a point."
          : "After a point is open in the first reply, a second question is asked. Each column is a different take on that thread. Hearthside illustrative data. Depth stays D: click a point."}</p>
        <div className="dlg-cont-page__beats" role="group" aria-label="Beat">
          {PHASES.map((p) => (
            <button key={p} type="button" className="dlg-cont-beat" aria-pressed={curPhase === p} onClick={() => setPhase(p)}>{PHASE_LABEL[p]}</button>
          ))}
        </div>
      </header>
      <div className="dlg-cont-grid" data-solo={shown.length === 1 || undefined}>
        {shown.map((id) => (
          <div key={id} className="dlg-cont-col">
            <p className="dlg-cont-label">{LABELS[id]}</p>
            <ThreadPanel key={`${id}:${curPhase}`} opt={id} phase={curPhase} />
          </div>
        ))}
      </div>
    </div>
  );
}
