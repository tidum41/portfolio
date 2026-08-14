/**
 * Motion contract — Instant vs Orchestrated
 * ==========================================
 * Layer A — route opacity (AnimationProvider):
 *   - Soft-nav or instant-back skips the route fade via peekSkipRouteFade().
 *
 * Layer B — page content:
 *   - About remounts inside AnimationProvider. Soft-nav skips the CSS enter
 *     so Work ↔ About is a tab switch, not a 1.14s fade from 0.
 *   - Work stays keep-alive (silk / Mux / CD). Content stays at rest while
 *     hidden (`display: none`). Instant on CaseStudyTOC Back AND primary nav.
 *   - Archive stays keep-alive like Work. First show may enter; returns snap.
 *
 * Layer C — first-load intro (data-intro / IntroOrchestrator / HeroText /
 * PS3Silk):
 *   - Cold "/" and tab/BFCache intro-replay only. Never use it for an SPA
 *     soft return.
 *
 * Primary paths:
 *   Cold "/"                  → intro, then orchestrated grid
 *   "/" ↔ about               → soft fade skip; keep-alive Work snaps; About skips enter
 *   "/" ↔ archive             → soft fade skip; both keep-alive shells snap
 *   about ↔ archive           → soft fade skip; Archive keep-alive / About skip enter
 *   "/" → case study          → soft fade skip; narrative entrance
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → soft fade skip; work snaps (tab, not replay)
 *   tab/BFCache return on "/" → distinct intro-replay
 */

const INSTANT_KEY = "instant-back";
const SOFT_KEY = "soft-nav";

/** Clicked Archive before Next.js flipped the pathname — paint posters now. */
let archiveShow = false;

export function markArchiveShow() {
  archiveShow = true;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("archive-show"));
}

export function peekArchiveShow(): boolean {
  return archiveShow;
}

export function clearArchiveShow() {
  if (!archiveShow) return;
  archiveShow = false;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("archive-show"));
}

export function subscribeArchiveShow(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("archive-show", onStoreChange);
  return () => window.removeEventListener("archive-show", onStoreChange);
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
  // Notify chrome that a primary-route transition started.
  window.dispatchEvent(new CustomEvent("soft-nav-start"));
}

export function peekSoftNav(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SOFT_KEY) === "1";
}

export function clearSoftNav() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SOFT_KEY);
}

/** Keep-alive Work snaps: case-study Back OR primary-nav tab return. */
export function peekKeepAliveSnap(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/** Keep-alive Work snaps on Back and on Work/About/Archive tab returns. */
export function peekInstantWorkContent(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/**
 * Latch soft-nav at destination first paint. AnimationProvider clears the
 * session flag in an effect; Layer A (route fade skip) must read this
 * during render before that clear — useState(initializer) is the latch.
 */
export function peekSoftNavArrival(): boolean {
  return peekSoftNav();
}
