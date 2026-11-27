/* Hybrid follow-up (dev only): the thread model behind ?opt=h, h1 and h2. No React here, so the page can read the lists.
   Numbers come from MOCK-DATA.md. Anything it does not hold is the visible text [PLACEHOLDER]. */

export const HYBRID_OPTS = ["h", "h1", "h2"] as const;
export type HybridOpt = (typeof HYBRID_OPTS)[number];
export const HYBRID_STATES = ["start", "open", "typed", "landed", "reset", "top"] as const;
export type HybridState = (typeof HYBRID_STATES)[number];
/** Variants the spec lists inside states 5 and 6. reset: cleared, override. top: other, tie, reply1. */
export const HYBRID_CASES = ["cleared", "override", "other", "tie", "reply1"] as const;
export type HybridCase = (typeof HYBRID_CASES)[number];
export const isHybrid = (v: string | undefined): v is HybridOpt => HYBRID_OPTS.includes(v as HybridOpt);

export const HYBRID_LABELS: Record<HybridOpt, string> = {
  h: "Hybrid. The opened group shows as a pill in the composer, then moves onto the question.",
  h1: "Alternative 1. Scope shows only after send, in reply 2’s header, with no composer pill.",
  h2: "Alternative 2. The hybrid, with reply 1 folded to a compact count bar.",
};

export const FOLLOWUP = "What do they say?";
export const TOP_QUESTION = "What about the top one?";
/** Exact match only. Detecting a named group in free text is not built. */
export const OVERRIDE_QUESTION = "How did repeat shoppers read it?";
export const ALL_LABEL = "All 300 shoppers";
export const PH = "[PLACEHOLDER]";
export const THEME_1 = "[PLACEHOLDER theme 1]";
export const THEME_2 = "[PLACEHOLDER theme 2]";
export const DRAFT_THEME = "Friday means the nearest one";
export const REPLY1_CHIP = "The 225 in reply 1";

export type Side = "friday" | "unsure";
export type ThemeKey = "t1" | "t2" | "draft" | "other";
export type Scope = { kind: Side; label: string } | { kind: "theme"; label: string; theme: ThemeKey };

export const GROUP_SCOPE: Record<Side, Scope> = {
  friday: { kind: "friday", label: "225 who read it as this Friday" },
  unsure: { kind: "unsure", label: "75 unsure" },
};

export type RowSet = "default" | "other" | "tie";
export type Row = { key: ThemeKey; label: string; focal?: boolean; remainder?: boolean };
export const ROW_SETS: Record<RowSet, Row[]> = {
  default: [{ key: "t1", label: THEME_1, focal: true }, { key: "t2", label: THEME_2 }, { key: "draft", label: DRAFT_THEME }],
  /* Other is a remainder, so it stays stone and cherry marks the top named theme. */
  other: [{ key: "other", label: "Other", remainder: true }, { key: "t1", label: THEME_1, focal: true }, { key: "t2", label: THEME_2 }],
  /* A tie at rank 1 has no cherry (Round 11). */
  tie: [{ key: "t1", label: THEME_1 }, { key: "t2", label: THEME_2 }, { key: "draft", label: DRAFT_THEME }],
};

export const themeScope = (key: ThemeKey): Scope => {
  const label = [...ROW_SETS.default, ...ROW_SETS.other].find((r) => r.key === key)?.label ?? PH;
  return { kind: "theme", theme: key, label: `${PH} who said ${label}` };
};

export type TurnKind = "themes" | "overview" | "override" | "top" | "clarify" | "other";
export type Turn = {
  kind: TurnKind;
  question: string;
  /** The static label on the bubble: the record of what was asked. */
  label?: string;
  scope: Scope | null;
  rowSet?: RowSet;
  /** Set once a reset folds this reply to its line. */
  folded?: boolean;
  expanded?: boolean;
  theme?: ThemeKey | null;
  /** top: what the reader's "top" resolved against. clarify: the chips offered and the one picked. */
  topOf?: RowSet | null;
  choices?: string[];
  pick?: string;
};

export type Thread = {
  asked: boolean;
  /** The open segment of reply 1 before any follow-up. */
  side: Side | null;
  /** Reply 1 reopened in place once the thread holds a follow-up. */
  r1Open: boolean;
  /** Scope set by what is open, or by the pill menu. */
  scope: Scope | null;
  /** Scope of the last question, which the next one inherits once the reader types. */
  inherit: Scope | null;
  draft: string;
  turns: Turn[];
};

export const EMPTY: Thread = { asked: false, side: null, r1Open: false, scope: null, inherit: null, draft: "", turns: [] };

/** The scope the next question would carry, which is what the pill shows. */
export function pendingScope(t: Thread): Scope | null {
  if (t.scope) return t.scope;
  return t.turns.length && t.draft.trim() ? t.inherit : null;
}

const themesTurn = (scope: Scope, question = FOLLOWUP, rowSet: RowSet = "default"): Turn => ({ kind: "themes", question, label: scope.label, scope, rowSet, theme: null });

export function ask(t: Thread, question: string): Thread {
  const q = question.trim();
  if (!q) return t;
  /* The first question is scripted: whatever is typed lands the study's one reply 1. */
  if (!t.asked) return { ...EMPTY, asked: true };
  const scope = pendingScope(t);
  const next = (turn: Turn, keep: Scope | null): Thread => ({ ...t, side: null, r1Open: false, scope: null, inherit: keep, draft: "", turns: [...t.turns, turn] });
  if (q === OVERRIDE_QUESTION) return next({ kind: "override", question: q, label: "Repeat shoppers", scope: null }, null);
  if (/\btop one\b/i.test(q) && t.turns.length) {
    const last = t.turns[t.turns.length - 1];
    /* "Top" resolves against the most recent reply, by the rows as drawn. */
    const topOf = last.kind === "themes" ? last.rowSet ?? "default" : null;
    const base = { question: q, label: scope?.label, scope, topOf };
    /* Reply 1 stays open while Dialogue asks, so both things the reader could mean are on screen. */
    if (t.r1Open) return { ...next({ ...base, kind: "clarify", choices: [REPLY1_CHIP, THEME_1] }, scope), r1Open: true, side: t.side };
    if (topOf === "tie") return next({ ...base, kind: "clarify", choices: [THEME_1, THEME_2] }, scope);
    return next({ ...base, kind: "top" }, scope);
  }
  if (!scope) return next({ kind: "overview", question: q, scope: null }, null);
  /* Only the first follow-up has a drawn answer. Later free questions keep their scope and wait on data. */
  if (!t.turns.length) return next(themesTurn(scope, q), scope);
  return next({ kind: "other", question: q, label: scope.label, scope }, scope);
}

/** "Ask about all 300 shoppers": re-ask the last question with the whole study as scope. */
export function resetToAll(t: Thread): Thread {
  const last = t.turns[t.turns.length - 1];
  if (!last) return t;
  const turns = t.turns.map((turn) => (turn.kind === "themes" ? { ...turn, folded: true, expanded: false, theme: null } : turn));
  return { ...t, r1Open: false, scope: null, inherit: null, draft: "", turns: [...turns, { kind: "overview", question: last.question, label: ALL_LABEL, scope: null }] };
}

/** Frozen states 1 to 6 of the spec, built through the same moves a reader makes. `deep` opens a theme row in reply 2. */
export function initialHybrid(state: HybridState, variant?: HybridCase, deep = false): Thread {
  if (state === "start") return EMPTY;
  const open: Thread = { ...EMPTY, asked: true, side: "friday", scope: GROUP_SCOPE.friday };
  if (state === "open") return open;
  const typed: Thread = { ...open, draft: FOLLOWUP };
  if (state === "typed") return typed;
  if (state === "reset" && variant === "cleared") return ask({ ...typed, scope: null }, FOLLOWUP);
  if (state === "reset" && variant === "override") return ask({ ...typed, draft: OVERRIDE_QUESTION }, OVERRIDE_QUESTION);
  let landed = ask(typed, FOLLOWUP);
  if (state === "landed") {
    if (!deep) return landed;
    return { ...landed, scope: themeScope("draft"), turns: [{ ...landed.turns[0], theme: "draft" }] };
  }
  if (state === "reset") return resetToAll(landed);
  if (variant === "other" || variant === "tie") landed = { ...landed, turns: [{ ...landed.turns[0], rowSet: variant }] };
  if (variant === "reply1") landed = { ...landed, r1Open: true, scope: GROUP_SCOPE.friday };
  return ask({ ...landed, draft: TOP_QUESTION }, TOP_QUESTION);
}
