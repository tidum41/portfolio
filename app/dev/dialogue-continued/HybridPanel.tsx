"use client";

/* Hybrid follow-up after depth D (dev only): ?opt=h, with h1 (scope only in reply 2's header) and h2 (reply 1 folds to a
   compact count bar). Built from AnswerCard, ChartVizCard, ChartBarList, ChartStackedBar, SourcePill, QuoteRow, Grow, the
   Round 19 segment header, the DepthMenu menu surface, the tooltip chip and the suggestion chip. No Lucide. No teal.
   The source pill inside the composer is a new placement, a prototype awaiting Mudit's OK. */
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import UserMessageBubble from "@/components/dialogue/product/UserMessageBubble";
import SourcePill from "@/components/dialogue/product/SourcePill";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import ChartBarList from "@/components/dialogue/product/chart/ChartBarList";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import { chartBarFill } from "@/components/dialogue/product/chart/chartSpec";
import { AnswerCard } from "@/components/dialogue/live/AnswerCard";
import { Grow } from "@/components/dialogue/live/Grow";
import { QuoteRow } from "@/components/dialogue/live/DialogueMotionStage";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { ArrowUpIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueCopy } from "@/components/dialogue/product/tokens";
import { ANA_TRANSCRIPT, QUOTE_LIST_FRIDAY, QUOTE_LIST_NEW } from "@/lib/dialogue/product/sampleData";
import { FRIDAY, QUESTION, TOTAL } from "@/components/dialogue/live/DeliveryDateTrial";
import {
  ALL_LABEL, DRAFT_THEME, GROUP_SCOPE, PH, REPLY1_CHIP, ROW_SETS, THEME_1,
  ask, initialHybrid, pendingScope, resetToAll, themeScope,
  type HybridCase, type HybridOpt, type HybridState, type Row, type Scope, type Side, type ThemeKey, type Thread, type Turn,
} from "./hybridModel";
import "../dialogue-variants/variants.css";
import "./hybrid.css";

type Quote = { participant: string; time: string; quote: string };

const [ANA, DEV] = QUOTE_LIST_FRIDAY;
const [KAI, RAE] = QUOTE_LIST_NEW;
/* MOCK-DATA 4c and 4d for the 75 side. */
const MEI: Quote = { participant: "Mei", time: "18:27–18:49", quote: "Friday which week?" };
const OWEN: Quote = { participant: "Owen", time: "07:12–07:30", quote: "I’d assume Friday after I order, so I checked the date." };

const SEGMENTS: Record<Side, { title: string; count: number; quotes: Quote[]; more: string; line: string }> = {
  friday: { title: "Read it as this Friday", count: FRIDAY, quotes: [ANA, DEV], more: "+223 more", line: "Picked from the 225 who read it as this Friday" },
  unsure: { title: "Unsure", count: TOTAL - FRIDAY, quotes: [MEI, OWEN], more: `+${PH} more`, line: "Picked from the 75 who were unsure" },
};

const startOf = (time: string) => time.split(/[–-]/)[0];

function SourceButton({ q, selected, onPick }: { q: Quote; selected: boolean; onPick: () => void }) {
  return (
    <button type="button" className="dlgh-source" aria-pressed={selected} onClick={onPick}>
      <SourcePill name={q.participant} time={startOf(q.time)} selected={selected} />
    </button>
  );
}

function SegmentHead({ title, count, swatch }: { title: string; count?: number; swatch: string }) {
  return (
    <p className="dlg-hero-head">
      <span className="dlg-sample-key" style={{ background: swatch }} aria-hidden />
      <span>{title}</span>
      {count !== undefined ? <span className="dlg-hero-head__count">{count}</span> : null}
    </p>
  );
}

/* Round 19 option C: header, source pills, one quote card, and the line saying who the quote was picked from. */
function Segment({ side }: { side: Side }) {
  const seg = SEGMENTS[side];
  const [at, setAt] = useState(0);
  const [clip, setClip] = useState(false);
  const q = seg.quotes[at];
  return (
    <div className="dp-side-sample dlg-stage__sample" data-side={side} data-hero="">
      <SegmentHead title={seg.title} count={seg.count} swatch={side === "friday" ? "var(--dp-chart-focal)" : "var(--dp-border-strong)"} />
      <div className="dp-sources">
        {seg.quotes.map((s, i) => <SourceButton key={s.participant} q={s} selected={i === at} onPick={() => { setAt(i); setClip(false); }} />)}
        <SourcePill name={seg.more} time="" />
      </div>
      <div className="dp-clip-quotes">
        <QuoteRow q={q} open={clip} onTap={() => setClip(!clip)} playSec={4} transcript={q.participant === "Ana" ? ANA_TRANSCRIPT : undefined} />
      </div>
      <p className="dlg-trial__more">{seg.line}</p>
    </div>
  );
}

/* Grow keeps its box while it folds, so it also needs the content it was showing. */
function useLast<T>(value: T | null): T | null {
  const [last, setLast] = useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}

function SegmentFold({ side }: { side: Side | null }) {
  const shown = useLast(side);
  return (
    <Grow open={!!side} className="dlg-trial__open">
      {shown ? <Segment key={shown} side={shown} /> : null}
    </Grow>
  );
}

function PlaceholderSource() {
  return (
    <div className="dp-clip-quote">
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-clip-quote__name">{PH}</span>
      </p>
      <p className="dp-clip-quote__text">{PH}</p>
    </div>
  );
}

/* Quotes under a theme. Only the draft theme names its quotes (Dev, Kai, Rae); the rest of the mapping is not in MOCK-DATA. */
function ThemeQuotes({ row, swatch }: { row: Row; swatch: string }) {
  const quotes: Quote[] = row.key === "draft" ? [DEV, KAI, RAE] : [];
  const [at, setAt] = useState(0);
  const [clip, setClip] = useState<number | null>(null);
  return (
    <div className="dp-side-sample dlg-stage__sample dlgh-theme" data-hero="">
      <SegmentHead title={row.label} swatch={swatch} />
      <div className="dp-sources">
        {quotes.length
          ? quotes.map((q, i) => <SourceButton key={q.participant} q={q} selected={i === at} onPick={() => { setAt(i); setClip(null); }} />)
          : <SourcePill name={PH} time="" />}
        <SourcePill name={`+${PH} more`} time="" />
      </div>
      <div className="dp-clip-quotes">
        {quotes.length
          ? quotes.map((q, i) => (
            <div key={q.participant} className="dlgh-quote" data-picked={i === at || undefined}>
              <QuoteRow q={q} open={clip === i} onTap={() => { setAt(i); setClip(clip === i ? null : i); }} playSec={4} />
            </div>
          ))
          : <PlaceholderSource />}
      </div>
      <p className="dlg-trial__more">Picked from the {PH} who said this</p>
    </div>
  );
}

const rowFill = (rows: Row[], i: number) => chartBarFill(i, rows[i].focal, false, rows[i].remainder);

function RankedRows({ rows, of, openKey, onRow }: { rows: Row[]; of: string; openKey?: ThemeKey | null; onRow?: (k: ThemeKey) => void }) {
  return (
    <div className="dlg-answer--rows dlgh-rows">
      {rows.map((r, i) => (
        <div key={r.key} className="dlgh-row" data-open={openKey === r.key || undefined}>
          {/* One row per list keeps each hit target exactly on its row. The fill is passed by rank. Lengths wait on counts. */}
          <ChartBarList rows={[{ label: r.label, value: 0, display: `${PH} of ${of}`, focal: r.focal, remainder: r.remainder }]} max={1} className={`dlgh-rank-${i}`} />
          {onRow ? <button type="button" className="dlgh-row__hit" aria-label={`Open quotes for ${r.label}`} aria-expanded={openKey === r.key} onClick={() => onRow(r.key)} /> : null}
        </div>
      ))}
    </div>
  );
}

function Why({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dlgh-why">
      <button type="button" className="dlg-disclose" aria-expanded={open} onClick={() => setOpen(!open)}>Why this chart</button>
      {open ? <p className="dlg-trial__more">{text}</p> : null}
    </div>
  );
}

const ofFor = (scope: Scope | null) => (scope?.kind === "friday" ? "225" : scope?.kind === "unsure" ? "75" : PH);
const themesTitle = (scope: Scope | null) =>
  scope?.kind === "friday" ? "What the 225 who read it as this Friday say, most mentioned first."
    : scope?.kind === "unsure" ? "What the 75 unsure say, most mentioned first." : PH;

function ThemesReply({ turn, onTheme }: { turn: Turn; onTheme: (k: ThemeKey) => void }) {
  const rows = ROW_SETS[turn.rowSet ?? "default"];
  const at = rows.findIndex((r) => r.key === turn.theme);
  const shownKey = useLast(turn.theme ?? null);
  const shown = rows.findIndex((r) => r.key === shownKey);
  return (
    <>
      <div data-spot="reply2">
        <ChartVizCard title={themesTitle(turn.scope)}>
          <RankedRows rows={rows} of={ofFor(turn.scope)} openKey={turn.theme} onRow={onTheme} />
          <p className="dp-chart-bars__note">
            Row count and counts are {PH}.{rows.some((r) => r.key === "draft") ? ` “${DRAFT_THEME}” is a draft label and its rank is ${PH}.` : ""}
          </p>
          {turn.scope?.kind === "friday" ? <Why text="Each count is out of the 225 you opened." /> : null}
        </ChartVizCard>
      </div>
      <Grow open={at >= 0} className="dlg-trial__open">
        {shown >= 0 ? <ThemeQuotes key={rows[shown].key} row={rows[shown]} swatch={rowFill(rows, shown)} /> : null}
      </Grow>
    </>
  );
}

function OverviewReply() {
  return (
    <ChartVizCard title={PH}>
      <RankedRows rows={ROW_SETS.default.slice(0, 2)} of={String(TOTAL)} />
      <p className="dp-chart-bars__note">Row count and counts are {PH}.</p>
    </ChartVizCard>
  );
}

function OverrideReply() {
  return (
    <ChartVizCard title={"88 of 125 repeat shoppers read ‘Arrives by Friday’ as this Friday."}>
      <div className="dlg-live__bar" data-layout="bar">
        <ChartStackedBar lanes total={125} segments={[
          { label: "Read it as this Friday", value: 88, display: "88 of 125", focal: true },
          { label: "Other", value: 37, display: "37 of 125", remainder: true },
        ]} />
      </div>
    </ChartVizCard>
  );
}

const clearLine = `The top theme among the 225 is ${THEME_1}, from ${PH} of 225.`;
const otherLine = `The largest row is Other, ${PH} of 225. The top named theme is ${THEME_1}.`;

/* A text answer that restates its target, then lists that theme's quotes. Its swatch is ink: reply 2 holds the cherry. */
function NamedThemeReply({ line, title }: { line: string; title: string }) {
  return (
    <>
      <p className="dlg-trial__line">{line}</p>
      <ThemeQuotes row={{ key: "t1", label: title }} swatch="var(--dp-ink)" />
    </>
  );
}

function TopReply({ turn }: { turn: Turn }) {
  if (turn.scope?.kind !== "friday" || !turn.topOf) return <p className="dlg-trial__line">{PH}</p>;
  return <NamedThemeReply line={turn.topOf === "other" ? otherLine : clearLine} title={THEME_1} />;
}

function Chips({ chips }: { chips: { text: string; onClick: () => void }[] }) {
  return (
    <div className="dlgh-follow">
      <p className="dlg-thin__label">Suggested follow-ups</p>
      <div className="dlgh-follow__row">
        {chips.map((c) => <button key={c.text} type="button" className="dlg-suggest" onClick={c.onClick}>{c.text}</button>)}
      </div>
    </div>
  );
}

function Question({ text, label }: { text: string; label?: string }) {
  if (!label) return <UserMessageBubble>{text}</UserMessageBubble>;
  return (
    <div className="dp-user-bubble dlgh-bubble" data-spot="scoped-question">
      <p className="dp-text-body">{text}</p>
      <p className="dlgh-bubble__scope">{label}</p>
    </div>
  );
}

function FoldLine({ open, onClick, children, spot }: { open: boolean; onClick: () => void; children: ReactNode; spot: string }) {
  return (
    <button type="button" className="dlgh-fold" data-spot={spot} aria-expanded={open} onClick={onClick}>
      <span className="dlgh-fold__text">{children}</span>
      <span className="dlg-clip-collapse" data-shown="" aria-hidden>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
    </button>
  );
}

/* The scope pill and its menu. The menu is the DepthMenu surface (tooltip chip surface, product CheckIcon). */
function ScopePill({ scope, onPick, onClear }: { scope: Scope; onPick: (s: Scope | null) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const options: { label: string; value: Scope | null }[] = [
    ...(scope.kind === "theme" ? [{ label: scope.label, value: scope }] : []),
    { label: GROUP_SCOPE.friday.label, value: GROUP_SCOPE.friday },
    { label: GROUP_SCOPE.unsure.label, value: GROUP_SCOPE.unsure },
    { label: ALL_LABEL, value: null },
  ];
  const items = () => [...(list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]") ?? [])];
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => list.current?.querySelector<HTMLButtonElement>("[aria-checked=true]")?.focus());
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("pointerdown", away); };
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const onListKey = (e: KeyboardEvent) => {
    const all = items();
    const at = all.findIndex((el) => el === document.activeElement);
    const go = (i: number) => all[(i + all.length) % all.length]?.focus();
    if (e.key === "ArrowDown") { e.preventDefault(); go(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(at - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(all.length - 1); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") setOpen(false);
  };
  return (
    <div className="dlgv-menu dlgh-menu" ref={root} data-open={open ? "" : undefined}>
      <span className="dp-source-pill dlgh-pill">
        <button ref={trigger} type="button" className="dlgh-pill__label" data-target="scope-pill" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className="dp-source-pill__name">{scope.label}</span>
        </button>
        <button type="button" className="dlgh-pill__x" data-target="scope-clear" aria-label={`Stop asking about ${scope.label}`} onClick={onClear}>
          <X size={16} weight="bold" aria-hidden />
        </button>
      </span>
      <div ref={list} className="dlgv-menu__list" role="menu" aria-label="Asking about" onKeyDown={onListKey}>
        {options.map((o) => {
          const checked = o.label === scope.label;
          return (
            <button key={o.label} type="button" role="menuitemradio" aria-checked={checked} tabIndex={open ? 0 : -1} className="dlgv-menu__item" onClick={() => { close(); onPick(o.value); }}>
              <span className="dlgv-menu__name">{o.label}</span>
              <span className="dlgv-menu__check" aria-hidden>{checked ? <CheckIcon /> : null}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Composer({ value, scope, onChange, onSend, onPick, onClear, tipId }: { value: string; scope: Scope | null; onChange: (v: string) => void; onSend: () => void; onPick: (s: Scope | null) => void; onClear: () => void; tipId: string }) {
  return (
    <div className="dp-study-chat__composer" data-export-chat-composer="true">
      <div className="dp-study-chat__composer-box">
        {scope ? (
          <div className="dlgh-scope" data-spot="composer-scope">
            <div className="dlgh-scope__inner">
              <span className="dlg-info dlgh-asking" tabIndex={0} aria-describedby={tipId}>
                Asking about
                <span id={tipId} role="tooltip" className="dp-hero-tooltip dlg-info__tip">Your next question uses the group you opened.</span>
              </span>
              <ScopePill scope={scope} onPick={onPick} onClear={onClear} />
            </div>
          </div>
        ) : null}
        <textarea
          className="dlg-cont__composer-input"
          data-target="composer-input"
          rows={2}
          value={value}
          placeholder={dialogueCopy.composerPlaceholder}
          aria-label="Ask about your study"
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

export default function HybridPanel({ opt, state, variant, deep }: { opt: HybridOpt; state: HybridState; variant?: HybridCase; deep?: boolean }) {
  const [t, setT] = useState<Thread>(() => initialHybrid(state, variant, deep));
  const threaded = t.turns.length > 0;
  const shownScope = opt === "h1" ? null : pendingScope(t);
  /* One cherry per screen: only the newest reply that draws a chart keeps it. Older figures draw in stone-900 (Round 9). */
  const cherryAt = t.turns.reduce((at, turn, i) => (turn.kind === "themes" || turn.kind === "overview" || turn.kind === "override" ? i : at), -1);

  const patchTurn = (i: number, patch: Partial<Turn>) => setT((cur) => ({ ...cur, turns: cur.turns.map((turn, j) => (j === i ? { ...turn, ...patch } : turn)) }));
  /* Scope follows what is open, before the first follow-up and inside the thread. */
  const openSide = (w: Side) => setT((cur) => {
    const side = cur.side === w ? null : w;
    return { ...cur, side, scope: side ? GROUP_SCOPE[side] : null };
  });
  const toggleReply1 = () => setT((cur) => {
    const r1Open = !cur.r1Open;
    return { ...cur, r1Open, side: r1Open ? "friday" : null, scope: r1Open ? GROUP_SCOPE.friday : null, turns: cur.turns.map((turn) => ({ ...turn, theme: null })) };
  });
  const toggleTheme = (i: number, key: ThemeKey) => setT((cur) => {
    const theme = cur.turns[i].theme === key ? null : key;
    return { ...cur, scope: theme ? themeScope(theme) : null, turns: cur.turns.map((turn, j) => (j === i ? { ...turn, theme } : turn)) };
  });

  const answer = (side: Side | null, onSide: (w: Side) => void) => (
    <>
      <AnswerCard sideOpen={side ?? false} onSide={onSide} still />
      <SegmentFold side={side} />
    </>
  );

  return (
    <div className="dlg-trial dlg-cont dlgh" data-mode="live" data-opt={opt} data-state={state} data-case={variant}>
      <div className={`dialogue-product-root dp-chat-panel-typography dlg-live dlg-stage dlg-trial__panel ${dialogueProductFontClassName}`}>
        <div className="dlg-trial__body" data-empty={!t.asked || undefined}>
          {t.asked ? <UserMessageBubble>{QUESTION}</UserMessageBubble> : null}
          {t.asked && !threaded ? answer(t.side, openSide) : null}
          {threaded ? (
            <div className="dlgh-muted dlgh-reply1">
              <FoldLine open={t.r1Open} onClick={toggleReply1} spot="reply1-fold">
                {opt === "h2" ? "225" : <span className="dlgh-opened">225</span>} of 300 read it as this Friday
              </FoldLine>
              {opt === "h2" && !t.r1Open ? (
                <button type="button" className="dlgh-compact dlg-live__bar" data-spot="reply1-bar" tabIndex={-1} aria-hidden onClick={toggleReply1}>
                  <ChartStackedBar total={TOTAL} segments={[
                    { label: "Read it as this Friday", value: FRIDAY, display: "225", focal: true },
                    { label: "Unsure", value: TOTAL - FRIDAY, display: "75", remainder: true },
                  ]} />
                </button>
              ) : null}
              <Grow open={t.r1Open} className="dlg-trial__open">
                {answer(t.side ?? "friday", (w) => setT((cur) => ({ ...cur, side: w, scope: GROUP_SCOPE[w] })))}
              </Grow>
            </div>
          ) : null}
          {t.turns.map((turn, i) => {
            const latest = i === t.turns.length - 1;
            const picked = turn.pick;
            return (
              <div key={i} className={`dlgh-turn${i === cherryAt ? "" : " dlgh-muted"}`}>
                <Question text={turn.question} label={turn.label} />
                {turn.kind === "themes" ? (
                  <>
                    {turn.folded ? (
                      <FoldLine open={!!turn.expanded} onClick={() => patchTurn(i, { expanded: !turn.expanded, theme: null })} spot="reply2-fold">
                        {THEME_1} led among the {ofFor(turn.scope)}
                      </FoldLine>
                    ) : null}
                    {!turn.folded || turn.expanded ? (
                      <>
                        {opt === "h1" && turn.scope ? <p className="dlg-hero-head" data-spot="reply2-scope-head">From the {turn.scope.label}</p> : null}
                        <ThemesReply turn={turn} onTheme={(k) => toggleTheme(i, k)} />
                      </>
                    ) : null}
                  </>
                ) : null}
                {turn.kind === "overview" ? <OverviewReply /> : null}
                {turn.kind === "override" ? <OverrideReply /> : null}
                {turn.kind === "top" ? <TopReply turn={turn} /> : null}
                {turn.kind === "other" ? <p className="dlg-trial__line">{PH}</p> : null}
                {turn.kind === "clarify" ? (
                  <>
                    <p className="dlg-trial__line">Which one do you mean?</p>
                    {!picked ? <Chips chips={(turn.choices ?? []).map((c) => ({ text: c, onClick: () => patchTurn(i, { pick: c }) }))} />
                      : picked === REPLY1_CHIP ? <p className="dlg-trial__line">{PH}</p>
                        : <NamedThemeReply line={picked === THEME_1 ? clearLine : PH} title={picked} />}
                  </>
                ) : null}
                {latest && turn.scope && (turn.kind !== "clarify" || picked) ? <Chips chips={[{ text: "Ask about all 300 shoppers", onClick: () => setT(resetToAll) }]} /> : null}
              </div>
            );
          })}
        </div>
        <Composer
          tipId={`dlgh-tip-${opt}`}
          value={t.draft}
          scope={shownScope}
          onChange={(draft) => setT((cur) => ({ ...cur, draft }))}
          onSend={() => setT((cur) => ask(cur, cur.draft))}
          onPick={(scope) => setT((cur) => ({ ...cur, scope, inherit: scope ? cur.inherit : null }))}
          onClear={() => setT((cur) => ({ ...cur, scope: null, inherit: null }))}
        />
      </div>
      <p className="dlgh-caption">Illustrative data.</p>
    </div>
  );
}
