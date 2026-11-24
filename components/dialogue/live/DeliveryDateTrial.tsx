"use client";

/* Depth r2, variant D (Mudit picked C+B, Nov 23 2026): the delivery-date answer as one interaction trial.
   Two short lines (B wording). Each line has one underlined point; a click opens more on that point under it, in place
   (C): the count opens the bar and one named quote, the quote opens its clip and synced transcript, the asks line opens
   the ranked asks. Nothing covers the answer. Reduced motion and phone widths show the same states as a static stepped strip.
   Hearthside mock data only (MOCK-DATA.md). Approved parts only: UserMessageBubble, AnswerCard (which draws ChartVizCard,
   ChartStackedBar and ChartBarList), QuoteRow, Grow. Icons come from product/icons via QuoteRow, never Lucide. */
import { useEffect, useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { AnswerCard, type AnswerData } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, TOP_ASKS, remainingCount } from "@/lib/dialogue/product/sampleData";

export const QUESTION = "How do shoppers read \u2018Arrives by Friday\u2019?";
export const TOTAL = 300;
export const FRIDAY = 225;
export const ASKS_SHOWN = 2;
/* Depth r4: the one source for both charts. Every take on /dev/dialogue-variants renders these through AnswerCard, so the
   same data always gets the same template (answerLayout), the same fills and the same labels. */
export const COUNT_ANSWER: AnswerData = { finding: "", total: TOTAL, groups: [{ label: "Read it as this Friday", value: FRIDAY, focal: true }, { label: "Unsure", value: TOTAL - FRIDAY }] };
/** Ranked asks overlap (one shopper can ask for two things), so they never split the 300: AnswerCard returns rows scaled to the top ask. */
export const ASKS_ANSWER: AnswerData = { finding: "", total: TOTAL, groups: TOP_ASKS.slice(0, ASKS_SHOWN).map((a, i) => ({ label: a.label, value: a.value, focal: i === 0 })) };
const ANA = QUOTE_LIST_FRIDAY[0];

/** Which points are open. The clip can only be open while the count's people are. `people: false` opens the count's
 *  chart alone (the Chart depth of a picker); left out, the count opens with its people, as a click on the count does. */
export type TrialState = { count: boolean; clip: boolean; asks: boolean; people?: boolean };
export const CLOSED: TrialState = { count: false, clip: false, asks: false };

/** Reduced motion or a phone width: show the stepped static strip. */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 600px)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

function Point({ open, target, onClick, children }: { open: boolean; target: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" className="dlg-trial__point" data-target={target} aria-expanded={open} onClick={onClick} disabled={!onClick}>
      {children}
    </button>
  );
}

function Wrap({ still, open, children }: { still: boolean; open: boolean; children: ReactNode }) {
  if (still) return open ? <div className="dlg-trial__open">{children}</div> : null;
  return <Grow open={open} className="dlg-trial__open">{children}</Grow>;
}

export function Answer({ state, set, points = true, footer, after }: { state: TrialState; set?: (s: TrialState) => void; points?: boolean; footer?: ReactNode; after?: ReactNode }) {
  const toggle = (k: keyof TrialState) => set && (() => {
    const next = { ...state, [k]: !state[k] };
    if (k === "count" && !next.count) next.clip = false;
    set(next);
  });
  const still = !set;
  const people = state.people !== false;
  const countLabel = `${FRIDAY} of ${TOTAL} shoppers`;
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
      <div className="dlg-trial__body">
        <UserMessageBubble>{QUESTION}</UserMessageBubble>
        <p className="dlg-trial__line">
          {points ? <Point open={state.count} target="trial-count" onClick={toggle("count")}>{countLabel}</Point> : countLabel} read it as this Friday.
        </p>
        <Wrap still={still} open={state.count}>
          {/* A side is open only when its people are on screen (Round 18): the chart alone shows no selected segment. */}
          <AnswerCard still sideOpen={people ? "friday" : false} answer={COUNT_ANSWER} />
          {people ? (
            <>
              <div className="dp-clip-quotes">
                <QuoteRow q={ANA} open={state.clip} onTap={toggle("clip") || undefined} playSec={4} transcript={ANA_TRANSCRIPT} />
              </div>
              <p className="dlg-trial__more">+{remainingCount(FRIDAY, 1)} more who read it as this Friday</p>
            </>
          ) : null}
        </Wrap>
        <p className="dlg-trial__line">
          The {points ? <Point open={state.asks} target="trial-asks" onClick={toggle("asks")}>top ask</Point> : "top ask"} is an exact date.
        </p>
        <Wrap still={still} open={state.asks}>
          <AnswerCard still answer={ASKS_ANSWER} />
          <p className="dlg-trial__more">{TOP_ASKS.length - ASKS_SHOWN} more asks</p>
        </Wrap>
        {after}
      </div>
      {footer}
    </div>
  );
}

const STEPS: { label: string; state: TrialState }[] = [
  { label: "Closed", state: CLOSED },
  { label: "One click on the count", state: { count: true, clip: false, asks: false } },
  { label: "At the source", state: { count: true, clip: true, asks: false } },
  { label: "One click on the asks", state: { count: false, clip: false, asks: true } },
];

/** The case study's single full interaction trial. `initial` is for stills and shots. */
export default function DeliveryDateTrial({ initial = CLOSED, stepped }: { initial?: TrialState; stepped?: boolean }) {
  const reduce = usePrefersReducedMotion();
  const [state, setState] = useState<TrialState>(initial);
  if (stepped ?? reduce) {
    return (
      <div className="dlg-trial dlg-trial--stepped" data-mode="stepped">
        {STEPS.map((s) => (
          <figure key={s.label} className="dlg-trial__step">
            <figcaption className="dlg-trial__step-label">{s.label}</figcaption>
            <Answer state={s.state} />
          </figure>
        ))}
      </div>
    );
  }
  return (
    <div className="dlg-trial" data-mode="live">
      <Answer state={state} set={setState} />
    </div>
  );
}
