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
 *   "/" → case study          → soft fade skip; narrative entrance preserved
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → soft fade skip; work orchestrated
 *   tab/BFCache return on "/" → distinct intro-replay
 */

const INSTANT_KEY = "instant-back";
const SOFT_KEY = "soft-nav";

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
