"use client";

/* Continued interaction after depth D: a second question lands on a thread where a point in reply 1 is (or was) open.
   Dev-only harness. Built from UserMessageBubble, AnswerCard, ChartVizCard, ChartBarList, QuoteRow, Grow, ChatComposer.
   Hearthside numbers only (MOCK-DATA). Theme counts among the 225 do not exist there, so they are labelled [PLACEHOLDER].
   No new product components. */
import { useState, type ReactNode } from "react";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import ChatComposer from "@/components/dialogue/product/ChatComposer";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ArrowUpIcon } from "@/components/dialogue/product/icons";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, QUOTE_LIST_NEW, remainingCount } from "@/lib/dialogue/product/sampleData";
import { COUNT_ANSWER, FRIDAY, QUESTION, TOTAL } from "@/components/dialogue/live/DeliveryDateTrial";
import HybridPanel from "./HybridPanel";
import { HYBRID_LABELS, HYBRID_OPTS, HYBRID_STATES, isHybrid, type HybridCase, type HybridOpt, type HybridState } from "./hybridModel";
import PaletteCheck from "./PaletteCheck";
import DecisionFrames from "./DecisionFrames";
import "./continued.css";
import "./palettes.css";

const FRIDAY_REMAINDER = FRIDAY - 1; // 225 minus Ana is 224

export const OPTS = ["a", "b", "c", "cs"] as const;
export type Opt = (typeof OPTS)[number];
export const PHASES = ["start", "landed", "next"] as const;
export type Phase = (typeof PHASES)[number];

export const LABELS: Record<Opt, string> = {
  a: "Reply 1 folds back to its count, with a mark that it was opened.",
  b: "Reply 1 stays open, and reply 2 arrives at the overview.",
  c: "Reply 2 stays on the opened point, shown as a chip on the question.",
  cs: "C at study scale. Reply 2 ranks reasons among the 225, with placeholder counts.",
};

const Q2 = "Do new and repeat shoppers read \u2018Arrives by Friday\u2019 the same way?";
const Q2_SCOPED = "What do they say?";
const CHIP = "Friday readers";
const NEW_OF = 14;
const NEW = 9;
const REPEAT_OF = 125;
const REPEAT = 88;
const ANA = QUOTE_LIST_FRIDAY[0];
const DEV = QUOTE_LIST_FRIDAY[1];
const KAI = QUOTE_LIST_NEW[0];
const RAE = QUOTE_LIST_NEW[1];
const GROUP_ROWS = [
  { label: "New shoppers", value: NEW / NEW_OF, display: `${NEW} of ${NEW_OF}`, focal: true },
  { label: "Repeat shoppers", value: REPEAT / REPEAT_OF, display: `${REPEAT} of ${REPEAT_OF}` },
];

/** Reasons among the 225. MOCK-DATA has the quotes (4c, 4d) but no per-theme counts, so values stay [PLACEHOLDER]. */
export const SCALE_THEMES = [
  { id: "planned", label: "Planned for this Friday", quotes: [ANA] },
  { id: "closest", label: "The closest Friday", quotes: [DEV, RAE] },
  { id: "new", label: "Meant this week", quotes: [KAI] },
] as const;
export type ThemeId = (typeof SCALE_THEMES)[number]["id"];
const SCALE_ROWS = SCALE_THEMES.map((th) => ({ label: th.label, value: 0, display: "[PLACEHOLDER]" }));

type Thread = { asked: boolean; r1: boolean; clip1: boolean; r2: boolean; clip2: boolean; theme: ThemeId | null; draft: string };

function initialThread(opt: Opt, phase: Phase): Thread {
  const asked = phase !== "start";
  const r1 = asked && opt === "b";
  const r2 = phase === "next" && opt !== "c" && opt !== "cs";
  const clip2 = opt === "c" && phase === "next";
  const theme: ThemeId | null = opt === "cs" && phase === "next" ? "planned" : null;
  return { asked, r1, clip1: false, r2, clip2, theme, draft: "" };
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

function AskComposer({ value, onChange, onSend }: { value: string; onChange: (v: string) => void; onSend: () => void }) {
  return (
    <div className="dp-study-chat__composer" data-export-chat-composer="true">
      <div className="dp-study-chat__composer-box">
        <textarea
          className="dlg-cont__composer-input"
          data-target="composer-input"
          rows={3}
          value={value}
          placeholder={dialogueCopy.composerPlaceholder}
          aria-label="Ask a follow-up"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        />
        <button type="button" className="dp-study-chat__composer-send" data-target="composer-send" aria-label="Send" onClick={onSend} style={{ opacity: value.trim() ? 1 : 0.5 }}>
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}

function ScopedQuestion() {
  return (
    <div className="dlg-cont__q">
      <span className="dp-chip dlg-cont__chip">{CHIP}</span>
      <UserMessageBubble>{Q2_SCOPED}</UserMessageBubble>
    </div>
  );
}

function ThreadPanel({ opt, phase }: { opt: Opt; phase: Phase }) {
  const [t, setT] = useState<Thread>(() => initialThread(opt, phase));
  const set = (patch: Partial<Thread>) => setT((cur) => ({ ...cur, ...patch }));
  const send = () => {
    if (t.asked) return;
    set({ asked: true, r1: opt === "b" ? t.r1 : false, clip1: opt === "b" ? t.clip1 : false, draft: "" });
  };
  const scoped = opt === "c" || opt === "cs";
  const openTheme = SCALE_THEMES.find((th) => th.id === t.theme);
  return (
    <div className="dlg-trial dlg-cont" data-mode="live" data-opt={opt} data-state={phase} data-asked={t.asked ? "true" : "false"} data-r1={t.r1 ? "open" : "folded"} data-r2={t.r2 ? "open" : "closed"} data-theme={t.theme || undefined}>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
        <div className="dlg-trial__body">
          <UserMessageBubble>{QUESTION}</UserMessageBubble>
          <p className="dlg-trial__line" data-spot="r1-folded">
            <Point open={t.r1} opened={t.asked || t.r1} target="r1-count" onClick={() => set({ r1: !t.r1, clip1: t.r1 ? false : t.clip1 })}>{`${FRIDAY} of ${TOTAL} shoppers`}</Point>
            {" "}read it as this Friday.
          </p>
          <Wrap open={t.r1}>
            <div data-spot="r1-pinned">
              <AnswerCard still sideOpen="friday" answer={COUNT_ANSWER} />
              <div className="dp-clip-quotes">
                <QuoteRow q={ANA} open={t.clip1} onTap={() => set({ clip1: !t.clip1 })} playSec={4} transcript={ANA_TRANSCRIPT} />
              </div>
              <p className="dlg-trial__more">+{FRIDAY_REMAINDER} more who read it as this Friday</p>
            </div>
          </Wrap>
          {t.asked && scoped ? (
            <>
              {opt === "c" ? (
                <div data-spot="c-scope">
                  <ScopedQuestion />
                  <div className="dp-clip-quotes" data-target="r2-ana">
                    <QuoteRow q={ANA} open={t.clip2} onTap={() => set({ clip2: !t.clip2 })} playSec={4} transcript={ANA_TRANSCRIPT} />
                  </div>
                  <p className="dlg-trial__more">+{FRIDAY_REMAINDER} more who read it as this Friday</p>
                </div>
              ) : (
                <>
                  <ScopedQuestion />
                  <p className="dlg-trial__line">Reasons among the 225 who read it as this Friday.</p>
                  <div data-spot="cs-themes">
                  <ChartVizCard>
                    <div className="dlg-cont__rank-plot">
                      <ChartBarList rows={SCALE_ROWS} max={1} />
                      <div className="dlg-cont__rank-hits">
                        {SCALE_THEMES.map((th) => (
                          <button
                            key={th.id}
                            type="button"
                            className="dlg-cont__rank-hit"
                            data-target={`r2-theme-${th.id}`}
                            aria-label={`Open ${th.label}`}
                            aria-expanded={t.theme === th.id}
                            onClick={() => set({ theme: t.theme === th.id ? null : th.id })}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="dp-chart-bars__note">Counts among the 225 are [PLACEHOLDER]. Theme names come from the Friday-reader quotes in MOCK-DATA 4c.</p>
                  </ChartVizCard>
                  </div>
                  <Wrap open={!!openTheme}>
                    {openTheme ? (
                      <>
                        <div className="dp-clip-quotes">
                          {openTheme.quotes.map((q) => <QuoteRow key={q.participant} q={q} open={false} />)}
                        </div>
                        <p className="dlg-trial__more">+[PLACEHOLDER] more</p>
                      </>
                    ) : null}
                  </Wrap>
                </>
              )}
            </>
          ) : null}
          {t.asked && !scoped ? (
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
          ) : null}
        </div>
        {t.asked ? <ChatComposer /> : <AskComposer value={t.draft} onChange={(draft) => set({ draft })} onSend={send} />}
      </div>
    </div>
  );
}

const PHASE_LABEL: Record<Phase, string> = {
  start: "Before the second question",
  landed: "Right after reply 2 lands",
  next: "A point in reply 2 is open",
};

const HYBRID_STATE_LABEL: Record<HybridState, string> = {
  start: "Start",
  open: "Reply 1 open",
  typed: "Follow-up typed",
  landed: "Reply 2 landed",
  reset: "Scope reset",
  top: "“Top one” asked",
};

/* In the grid, the three shared beats map onto the hybrid's states. "A point in reply 2 is open" also opens a theme row. */
const GRID_STATE: Record<Phase, HybridState> = { start: "typed", landed: "landed", next: "landed" };

export type Pal = "1" | "2" | "3";
export type Sim = "gray" | "deutan" | "protan";

/* Colorblind review filters for ?sim: the Viénot 1999 matrices in linear RGB. */
function SimFilters() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
      <filter id="dlg-sim-deutan" colorInterpolationFilters="linearRGB">
        <feColorMatrix type="matrix" values="0.29275 0.70725 0 0 0  0.29275 0.70725 0 0 0  -0.02234 0.02234 1 0 0  0 0 0 1 0" />
      </filter>
      <filter id="dlg-sim-protan" colorInterpolationFilters="linearRGB">
        <feColorMatrix type="matrix" values="0.11238 0.88762 0 0 0  0.11238 0.88762 0 0 0  0.00401 -0.00401 1 0 0  0 0 0 1 0" />
      </filter>
    </svg>
  );
}

export default function ContinuedLab({ opt, phase = "landed", hybridState = "landed", variant, pal, check, sim, frame }: { opt?: Opt | HybridOpt; phase?: Phase; hybridState?: HybridState; variant?: HybridCase; pal?: Pal; check?: boolean; sim?: Sim; frame?: "1" | "2" }) {
  const [curPhase, setPhase] = useState<Phase>(phase);
  const [curState, setState] = useState<HybridState>(hybridState);
  const solo = isHybrid(opt) ? opt : undefined;
  const shown: Opt[] = solo ? [] : opt && !isHybrid(opt) ? [opt] : [...OPTS];
  const hybrids: HybridOpt[] = solo ? [solo] : opt ? [] : [...HYBRID_OPTS];
  if (frame) {
    return (
      <div className="dlg-cont-page" data-pal={pal} data-sim={sim}>
        <SimFilters />
        <header className="dlg-cont-page__head">
          <h1 className="dlg-cont-page__title">Continued interaction</h1>
        </header>
        <DecisionFrames frame={frame} />
      </div>
    );
  }
  return (
    <div className="dlg-cont-page" data-pal={pal} data-sim={sim}>
      <SimFilters />
      <header className="dlg-cont-page__head">
        <h1 className="dlg-cont-page__title">Continued interaction</h1>
        <p className="dlg-cont-page__sub">{opt
          ? "After a point is open in the first reply, a second question is asked. Hearthside illustrative data. Depth stays D: click a point."
          : "After a point is open in the first reply, a second question is asked. Each column is a different take on that thread. Hearthside illustrative data. Depth stays D: click a point."}</p>
        {pal ? <p className="dlg-cont-page__sub">{`Chart palette ${pal}. Every segment takes its color by position. The rest of the UI keeps Dialogue's tokens.`}</p> : null}
        <div className="dlg-cont-page__beats" role="group" aria-label="Beat">
          {solo ? HYBRID_STATES.map((s) => (
            <button key={s} type="button" className="dlg-cont-beat" aria-pressed={curState === s} onClick={() => setState(s)}>{HYBRID_STATE_LABEL[s]}</button>
          )) : PHASES.map((p) => (
            <button key={p} type="button" className="dlg-cont-beat" aria-pressed={curPhase === p} onClick={() => setPhase(p)}>{PHASE_LABEL[p]}</button>
          ))}
        </div>
      </header>
      <div className="dlg-cont-grid" data-solo={!!opt || undefined}>
        {shown.map((id) => (
          <div key={id} className="dlg-cont-col">
            <p className="dlg-cont-label">{LABELS[id]}</p>
            <ThreadPanel key={`${id}:${curPhase}`} opt={id} phase={curPhase} />
          </div>
        ))}
        {hybrids.map((id) => {
          const state = solo ? curState : GRID_STATE[curPhase];
          const deep = !solo && curPhase === "next";
          return (
            <div key={id} className="dlg-cont-col">
              <p className="dlg-cont-label">{HYBRID_LABELS[id]}</p>
              <HybridPanel key={`${id}:${state}:${deep}`} opt={id} state={state} variant={solo && state === hybridState ? variant : undefined} deep={deep} />
            </div>
          );
        })}
      </div>
      {pal && check ? <PaletteCheck /> : null}
    </div>
  );
}
