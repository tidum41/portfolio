"use client";

/* Depth r4 figure 3 (dev only): one reply with four findings, so the cost of a depth picked per reply shows at scale.
   Hearthside mock only (MOCK-DATA.md): 4c 225 of 300, 4f top asks 41 and 28 of 300, 4g repeat shoppers 88 of 125 and
   2 of 300 missed a delivery (thin, so a flag and no chart). MOCK-DATA holds no quote for the repeat shoppers, so their
   People depth stays the chart alone. Built from the trial's parts: UserMessageBubble, AnswerCard, QuoteRow, Grow, the
   thin flag. */
import { useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import { AnswerCard, type AnswerData } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { InfoCircleIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, TOP_ASKS, remainingCount } from "@/lib/dialogue/product/sampleData";
import { THIN_FLAG } from "@/lib/dialogue/product/thinCopy";
import { ASKS_ANSWER, ASKS_SHOWN, COUNT_ANSWER, FRIDAY, QUESTION } from "@/components/dialogue/live/DeliveryDateTrial";

const REPEAT: AnswerData = { finding: "", total: 125, groups: [{ label: "Read it as this Friday", value: 88, focal: true }, { label: "Other", value: 37 }] };
type Key = "count" | "asks" | "repeat" | "missed";
const KEYS: Key[] = ["count", "asks", "repeat", "missed"];

function Pt({ k, open, on, children }: { k: Key; open: boolean; on?: (k: Key) => void; children: ReactNode }) {
  if (!on) return <>{children}</>;
  return <button type="button" className="dlg-trial__point" data-target={`four-${k}`} aria-expanded={open} onClick={() => on(k)}>{children}</button>;
}

/** `all` opens every finding at People, as a depth picked before asking does. Otherwise each point opens on a click. */
export default function FourFindings({ all = false }: { all?: boolean }) {
  const [open, setOpen] = useState<Record<Key, boolean>>(() => Object.fromEntries(KEYS.map((k) => [k, all])) as Record<Key, boolean>);
  const [clip, setClip] = useState(false);
  const on = all ? undefined : (k: Key) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const wrap = (k: Key, body: ReactNode) => (all ? <div className="dlg-trial__open">{body}</div> : <Grow open={open[k]} className="dlg-trial__open">{body}</Grow>);
  return (
    <div className="dlg-trial" data-mode="live" data-four={all ? "all" : "points"}>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
        <div className="dlg-trial__body">
          <UserMessageBubble>{QUESTION}</UserMessageBubble>
          <p className="dlg-trial__line"><Pt k="count" open={open.count} on={on}>{FRIDAY} of 300 shoppers</Pt> read it as this Friday.</p>
          {wrap("count", <>
            <AnswerCard still sideOpen="friday" answer={COUNT_ANSWER} />
            <div className="dp-clip-quotes"><QuoteRow q={QUOTE_LIST_FRIDAY[0]} open={clip} onTap={() => setClip((c) => !c)} playSec={4} transcript={ANA_TRANSCRIPT} /></div>
            <p className="dlg-trial__more">+{remainingCount(FRIDAY, 1)} more who read it as this Friday</p>
          </>)}
          <p className="dlg-trial__line">The <Pt k="asks" open={open.asks} on={on}>top ask</Pt> is an exact date.</p>
          {wrap("asks", <>
            <AnswerCard still answer={ASKS_ANSWER} />
            <p className="dlg-trial__more">{TOP_ASKS.length - ASKS_SHOWN} more asks</p>
          </>)}
          <p className="dlg-trial__line">Among repeat shoppers, <Pt k="repeat" open={open.repeat} on={on}>88 of 125</Pt> read it that way.</p>
          {wrap("repeat", <AnswerCard still answer={REPEAT} />)}
          <p className="dlg-trial__line"><Pt k="missed" open={open.missed} on={on}>2 of 300</Pt> missed a delivery over it.</p>
          {wrap("missed", (
            <div className="dp-low-signal">
              <InfoCircleIcon className="dp-low-signal__icon" />
              <p className="dp-low-signal__text">{THIN_FLAG}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
