"use client";

/* Depth r4: one case-study iteration, "level of depth for each reply", as four live takes on the same question and the
   same Hearthside data (MOCK-DATA.md). One row of beat buttons remounts every column at the same moment, so the same state
   sits side by side; each column stays live after that.
   1. P10 / round 16 picker: a tab row above the composer, picked before asking (Dovetail Fast / Deep).
   2. After the reply, chips in the composer open one point in place.
   3. D, the /dialogue trial: click a dotted point in the reply.
   4. A model-picker style menu in the composer (DepthMenu, dev only), picked before asking.
   Every column renders the reply through DeliveryDateTrial's Answer, so the count and the asks always get the same
   template, fills and labels (the r4 fix for the picker's People and Chart graphs). Approved parts and --dp tokens only.
   No Lucide. */
import { useState, type ReactNode } from "react";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { Answer, CLOSED, QUESTION, type TrialState } from "@/components/dialogue/live/DeliveryDateTrial";
import DepthMenu, { DEPTHS, type Depth } from "./DepthMenu";
import { BEATS, type Beat } from "./beats";

export type { Beat };

type Option = "picker" | "chips" | "point" | "menu";
/* Dev labels. Clicks are counted from the default reply (Insight) in this UI; "Ask again" stands in for typing the question again. */
const HOW: Record<Option, Record<Beat, string>> = {
  picker: {
    ask: "Depth is picked here, before the question is sent",
    reply: "The reply comes back at Insight, the default",
    count: "Pick Chart before asking again: 3 clicks and a second reply",
    source: "Pick People before asking again, then tap Ana: 4 clicks",
    asks: "Pick Chart before asking again: 3 clicks and a second reply",
  },
  chips: {
    ask: "Nothing to pick before asking",
    reply: "Chips for each point sit in the composer under the reply",
    count: "Tap Friday readers: 1 click",
    source: "Tap Friday readers, then Ana: 2 clicks",
    asks: "Tap Top asks: 1 click",
  },
  point: {
    ask: "Nothing to pick before asking",
    reply: "Each point in the reply carries a dotted underline",
    count: "Click 225 of 300 shoppers: 1 click",
    source: "Click the count, then Ana: 2 clicks",
    asks: "Click top ask: 1 click",
  },
  menu: {
    ask: "Depth is picked here, from a menu, before the question is sent",
    reply: "The reply comes back at Insight, the default",
    count: "Open the menu and pick Chart before asking again: 4 clicks and a second reply",
    source: "Pick People from the menu before asking again, then tap Ana: 5 clicks",
    asks: "Open the menu and pick Chart before asking again: 4 clicks and a second reply",
  },
};

/** What a depth returns for this reply. Chart opens the count's chart alone; People adds the count's people. */
function depthState(d: Depth, clip = false): TrialState {
  if (d === "Insight") return CLOSED;
  if (d === "Chart") return { count: true, people: false, clip: false, asks: true };
  return { count: true, people: true, clip, asks: true };
}
const BEAT_DEPTH: Record<Beat, Depth> = { ask: "Insight", reply: "Insight", count: "Chart", source: "People", asks: "Chart" };
const BEAT_POINT: Record<Beat, TrialState> = {
  ask: CLOSED,
  reply: CLOSED,
  count: { count: true, clip: false, asks: false },
  source: { count: true, clip: true, asks: false },
  asks: { count: false, clip: false, asks: true },
};

function Send({ ready, onSend }: { ready: boolean; onSend: () => void }) {
  return (
    <button type="button" className="dp-study-chat__composer-send dlg-live__send" data-target="send" data-ready={ready ? "" : undefined} aria-label="Send" disabled={!ready} onClick={onSend}>
      <ArrowUpIcon />
    </button>
  );
}

/** The panel before the question is sent: an empty thread over the composer. */
function AskPanel({ footer, mark }: { footer: ReactNode; mark: Option }) {
  return (
    <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`} data-compare={mark}>
      <div className="dlg-trial__body dlgv-empty" />
      {footer}
    </div>
  );
}

function ComposerText({ asked }: { asked: boolean }) {
  return asked ? <p className="dp-study-chat__composer-placeholder">{dialogueCopy.composerPlaceholder}</p> : <p className="dp-study-chat__composer-text">{QUESTION}</p>;
}

/** A plain composer: the question is sent as typed, with no depth to pick. */
function PlainComposer({ asked, onSend }: { asked: boolean; onSend: () => void }) {
  return (
    <div className="dp-study-chat__composer">
      <div className="dp-study-chat__composer-box">
        <ComposerText asked={asked} />
        <Send ready={!asked} onSend={onSend} />
      </div>
    </div>
  );
}

function AskAgain({ onClick }: { onClick: () => void }) {
  return <button type="button" className="dlg-live__reset dlgv-reset" data-target="ask-again" onClick={onClick}>Ask again</button>;
}

/** 1. The P10 / round 16 picker: Dialogue's tab row above the composer, single select, locked once the question is sent. */
export function PickerTake({ beat }: { beat: Beat }) {
  const [pick, setPick] = useState<Depth>(BEAT_DEPTH[beat]);
  const [asked, setAsked] = useState(beat !== "ask");
  const [clip, setClip] = useState(beat === "source");
  const footer = (
    <div className="dp-study-chat__composer">
      <div className="dlg-depth" role="radiogroup" aria-label="Answer depth">
        {DEPTHS.map((l, i) => (
          <button key={l} type="button" role="radio" aria-checked={pick === l} data-target={`depth-${i}`} className="dlg-depth__opt" disabled={asked} onClick={() => setPick(l)}>{l}</button>
        ))}
      </div>
      <div className="dp-study-chat__composer-box">
        <ComposerText asked={asked} />
        <Send ready={!asked} onSend={() => { setAsked(true); setClip(false); }} />
      </div>
    </div>
  );
  const state = depthState(pick, clip);
  return (
    <div className="dlg-trial" data-mode="live" data-compare="picker" data-asked={asked ? "true" : "false"} data-pick={pick.toLowerCase()}>
      {asked ? (
        <Answer state={state} set={(s) => setClip(s.clip)} points={false} footer={footer} after={<AskAgain onClick={() => { setAsked(false); setClip(false); }} />} />
      ) : <AskPanel mark="picker" footer={footer} />}
    </div>
  );
}

/** 2. After the reply, chips in the composer open one point in place, with the same depth steps as D. */
function ChipsTake({ beat }: { beat: Beat }) {
  const [asked, setAsked] = useState(beat !== "ask");
  const [state, setState] = useState<TrialState>(BEAT_POINT[beat]);
  const pick = (k: "count" | "asks") => setState((s) => (k === "count" ? { count: !s.count, clip: !s.count ? s.clip : false, asks: false } : { count: false, clip: false, asks: !s.asks }));
  if (!asked) return <div className="dlg-trial" data-mode="live" data-compare="chips"><AskPanel mark="chips" footer={<PlainComposer asked={false} onSend={() => setAsked(true)} />} /></div>;
  const footer = (
    <div className="dp-study-chat__composer">
      <div className="dlg-depth" role="radiogroup" aria-label="Open an insight">
        <button type="button" role="radio" className="dlg-depth__opt" aria-checked={state.count} data-target="insight-friday" onClick={() => pick("count")}>Friday readers</button>
        <button type="button" role="radio" className="dlg-depth__opt" aria-checked={state.asks} data-target="insight-asks" onClick={() => pick("asks")}>Top asks</button>
      </div>
    </div>
  );
  return (
    <div className="dlg-trial" data-mode="live" data-compare="chips">
      <Answer state={state} set={setState} points={false} footer={footer} />
    </div>
  );
}

/** 3. D as shipped on /dialogue: a click on a dotted point opens more on that point, in place. */
export function PointTake({ beat }: { beat: Beat }) {
  const [asked, setAsked] = useState(beat !== "ask");
  const [state, setState] = useState<TrialState>(BEAT_POINT[beat]);
  if (!asked) return <div className="dlg-trial" data-mode="live" data-compare="point"><AskPanel mark="point" footer={<PlainComposer asked={false} onSend={() => setAsked(true)} />} /></div>;
  return (
    <div className="dlg-trial" data-mode="live" data-compare="point">
      <Answer state={state} set={setState} />
    </div>
  );
}

/** 4. Option 4: the depth for this reply picked from a menu in the composer, like a model picker. The menu stays live
 *  after the reply because its pick applies to the next reply, as a model pick does. */
export function MenuTake({ beat, menuOpen = false }: { beat: Beat; menuOpen?: boolean }) {
  const [depth, setDepth] = useState<Depth>(BEAT_DEPTH[beat]);
  const [asked, setAsked] = useState(beat !== "ask");
  const [clip, setClip] = useState(beat === "source");
  const [open, setOpen] = useState(menuOpen);
  const [replyDepth, setReplyDepth] = useState<Depth>(BEAT_DEPTH[beat]);
  const send = () => { setReplyDepth(depth); setAsked(true); setClip(false); setOpen(false); };
  const footer = (
    <div className="dp-study-chat__composer">
      <div className="dp-study-chat__composer-box dlgv-menu-box">
        <ComposerText asked={asked} />
        <div className="dlgv-menu__row">
          <DepthMenu value={depth} onChange={setDepth} open={open} onOpenChange={setOpen} />
          <Send ready={!asked} onSend={send} />
        </div>
      </div>
    </div>
  );
  return (
    <div className="dlg-trial" data-mode="live" data-compare="menu" data-asked={asked ? "true" : "false"} data-pick={depth.toLowerCase()}>
      {asked ? (
        <Answer state={depthState(replyDepth, clip)} set={(s) => setClip(s.clip)} points={false} footer={footer} after={<AskAgain onClick={() => { setAsked(false); setClip(false); }} />} />
      ) : <AskPanel mark="menu" footer={footer} />}
    </div>
  );
}

const COLUMNS: { key: Option; name: string; when: string }[] = [
  { key: "picker", name: "1. Tab row above the composer (P10, round 16)", when: "Depth picked before the reply" },
  { key: "chips", name: "2. Chips in the composer, after the reply", when: "Depth picked after the reply" },
  { key: "point", name: "3. Click a point in the reply (D, on /dialogue)", when: "Depth picked after the reply" },
  { key: "menu", name: "4. Menu in the composer, like a model picker", when: "Depth picked before the reply" },
];

export default function DepthCompare({ initialBeat = "reply", menuOpen = false }: { initialBeat?: Beat; menuOpen?: boolean }) {
  const [beat, setBeat] = useState<Beat>(initialBeat);
  return (
    <section className="dlgv-iter" data-pair="compare" data-beat={beat}>
      <header className="dlgv-iter__head">
        <h1 className="dlgv-iter__title">Level of depth for each reply</h1>
        <p className="dlgv-iter__sub">Same question, same Hearthside data in every column. A beat sets all four to the same moment; each column stays live after it.</p>
        <nav className="dlgv-beats" aria-label="Beat">
          {BEATS.map((b, i) => (
            <button key={b.id} type="button" className="dlgv-beat" aria-pressed={beat === b.id} data-beat={b.id} onClick={() => setBeat(b.id)}>
              <span className="dlgv-beat__n">{i + 1}</span>{b.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="dlgv-compare">
        {COLUMNS.map((c) => (
          <div key={c.key} className="dlgv-col" data-col={c.key}>
            <p className="dlgv-label">{c.name}</p>
            <p className="dlgv-when" data-when={c.when.includes("before") ? "before" : "after"}>{c.when}</p>
            <p className="dlgv-how">{HOW[c.key][beat]}</p>
            {/* A beat remounts every take at that beat's state; after that each column runs on its own. */}
            {c.key === "picker" ? <PickerTake key={beat} beat={beat} /> : c.key === "chips" ? <ChipsTake key={beat} beat={beat} /> : c.key === "point" ? <PointTake key={beat} beat={beat} /> : <MenuTake key={beat} beat={beat} menuOpen={menuOpen && beat === initialBeat} />}
          </div>
        ))}
      </div>
    </section>
  );
}
