/**
 * Motion contract — Instant vs Orchestrated
 * ==========================================
 * Layer A — route opacity (AnimationProvider):
 *   - Soft-nav or instant-back skips the route fade via peekSkipRouteFade().
 *   - Soft-nav does not imply that destination content is instant.
 *
 * Layer B — work-shell content (PersistentWorkShell / EntranceItem):
 *   - Instant only for CaseStudyTOC Back on this arrival (peekInstantBack()).
 *   - Orchestrated for every other arrival at "/": cold work after the intro,
 *     primary-nav returns (about/archive/nav work), and case-study → work via
 *     primary chrome. These use ENTRANCE_DEFAULTS; do not fire intro-replay.
 *
 * Layer C — first-load intro (data-intro / IntroOrchestrator / HeroText /
 * PS3Silk):
 *   - Cold "/" and tab/BFCache intro-replay only. Never use it for an SPA
 *     soft return.
 *
 * Layer D — route lifetime:
 *   - Remounting chrome (about, archive, case studies, PS3ControlPanel) may
 *     own an entrance. Keep-alive work media/grid/silk must not remount.
 *
 * Primary paths:
 *   Cold "/"                  → intro, then orchestrated grid
 *   "/" ↔ about/archive       → soft fade skip; destination orchestrated
 *                                (Work ↔ About also owns a persistent silk handoff)
 *   "/" → case study          → soft fade skip; brief silk departure, then
 *                                narrative entrance
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → soft fade skip; work orchestrated
 *   tab/BFCache return on "/" → distinct intro-replay
 */

const INSTANT_KEY = "instant-back";
const SOFT_KEY = "soft-nav";
const PATTERN_KEY = "pattern-transition";

export type PatternTransitionKind =
  | "work-to-about"
  | "about-to-work"
  | "work-to-case-study";

type PatternTransitionIntent = {
  from: string;
  to: string;
  kind: PatternTransitionKind;
};

function pathOf(href: string) {
  return href.split("?")[0]?.split("#")[0] ?? href;
}

export function markInstantBack() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INSTANT_KEY, "1");
}

export function peekInstantBack(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(INSTANT_KEY) === "1";
}

export function clearInstantBack() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(INSTANT_KEY);
}

/** Primary nav between work / about / archive — skip opacity crossfade. */
export function markSoftNav() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SOFT_KEY, "1");
}

export function peekSoftNav(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SOFT_KEY) === "1";
}

export function clearSoftNav() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SOFT_KEY);
}

/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/**
 * Records a visual handoff only when navigation has actually been committed
 * (pointer/click), never during route or poster prefetch. The persistent silk
 * host consumes this once the pathname changes and can safely retarget it if
 * the user immediately chooses another destination.
 */
export function markPatternTransition(href: string) {
  if (typeof window === "undefined") return;

  const from = window.location.pathname;
  const to = pathOf(href);
  let kind: PatternTransitionKind | null = null;

  if (from === "/" && to === "/about") kind = "work-to-about";
  else if (from === "/about" && to === "/") kind = "about-to-work";
  else if (from === "/" && to !== "/" && to !== "/about" && to !== "/archive") {
    kind = "work-to-case-study";
  }

  if (!kind) return;
  sessionStorage.setItem(PATTERN_KEY, JSON.stringify({ from, to, kind } satisfies PatternTransitionIntent));
}

/** Returns and clears the committed intent for this exact route change. */
export function takePatternTransition(from: string, to: string): PatternTransitionKind | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PATTERN_KEY);
    sessionStorage.removeItem(PATTERN_KEY);
    if (!raw) return null;
    const intent = JSON.parse(raw) as PatternTransitionIntent;
    return intent.from === from && intent.to === to ? intent.kind : null;
  } catch {
    sessionStorage.removeItem(PATTERN_KEY);
    return null;
  }
}
