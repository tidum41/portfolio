/**
 * Motion contract — Instant vs Orchestrated
 * ==========================================
 * Layer A — route opacity (AnimationProvider):
 *   - Soft-nav or instant-back skips the route fade via peekSkipRouteFade().
 *
 * Layer B — page content:
 *   - About remounts inside AnimationProvider. Framer / CSS enter from first paint.
 *   - Work stays keep-alive (silk / Mux / CD). Instant only for
 *     CaseStudyTOC Back (peekInstantBack()). Primary nav skips the route
 *     fade (Layer A) and can replay Work's fade-up.
 *   - Archive stays keep-alive with LQIP posters decoding off-route
 *     (visibility hidden, not display:none). Show replays `.ps3-enter`.
 *     Full images attach only while `/archive` is visible.
 *
 * Layer C — first-load intro (data-intro / IntroOrchestrator / HeroText /
 * PS3Silk):
 *   - Cold "/" and tab/BFCache intro-replay only. Never use it for an SPA
 *     soft return.
 *
 * Primary paths:
 *   Cold "/"                  → intro, then orchestrated grid
 *   "/" ↔ about               → soft fade skip; About remounts and enters
 *   "/" ↔ archive             → soft fade skip; keep-alive posters + CSS enter
 *   about ↔ archive           → soft fade skip; Archive keep-alive / About remount
 *   "/" → case study          → soft fade skip; narrative entrance
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → soft fade skip; work fade-up
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

/** Case-study Back only — keep-alive content snaps. Primary nav plays enter. */
export function peekKeepAliveSnap(): boolean {
  return peekInstantBack();
}

/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/** Case-study Back only — work content snaps. Primary nav plays enter. */
export function peekInstantWorkContent(): boolean {
  return peekInstantBack();
}

/**
 * Latch soft-nav at destination first paint. AnimationProvider clears the
 * session flag in an effect; Layer A (route fade skip) must read this
 * during render before that clear — useState(initializer) is the latch.
 */
export function peekSoftNavArrival(): boolean {
  return peekSoftNav();
}
