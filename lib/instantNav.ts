/**
 * Motion contract — Instant vs Orchestrated
 * ==========================================
 * Layer A — route opacity (AnimationProvider):
 *   - Soft-nav or instant-back skips the route fade via peekSkipRouteFade().
 *
 * Layer B — work-shell content (PersistentWorkShell / EntranceItem):
 *   - Instant for CaseStudyTOC Back (peekInstantBack()) AND soft primary-nav
 *     returns to "/" (peekSoftNav()) — posters already painted; replaying the
 *     entrance chorus on every About/Archive return felt like lag.
 *   - Orchestrated only for cold "/" after the intro gate (no soft/instant flag).
 *
 * Layer C — first-load intro (data-intro / IntroOrchestrator / HeroText /
 * PS3Silk):
 *   - Cold "/" and tab/BFCache intro-replay only. Never use it for an SPA
 *     soft return.
 *
 * Layer D — route lifetime:
 *   - Work / About / Archive use persistent shells in the root layout (display
 *     toggle, no remount on soft-nav). Case studies still remount via
 *     AnimationProvider children. Mux/CD may pause off "/" and reclaim after
 *     idle; About CD is viewport-gated; About below-fold mounts on idle.
 *
 * Primary paths:
 *   Cold "/"                  → intro, then orchestrated grid
 *   "/" ↔ about/archive       → soft fade skip; persistent shells show/hide
 *   First about/archive visit → mount shell (budget-split) + idle warmup helps
 *   Later about/archive visit → display toggle only (no remount)
 *   "/" → case study          → soft fade skip; narrative entrance
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → soft fade skip; work content instant
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
  // Notify chrome (custom cursor) to mute trail/hit-tests during the hitch window.
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

/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/** Work shell / silk: treat soft return like Back for content snap. */
export function peekInstantWorkContent(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/**
 * Latch soft-nav at destination first paint. AnimationProvider clears the
 * session flag in an effect; pages that should snap (About) must read this
 * during render before that clear — useState(initializer) is the latch.
 */
export function peekSoftNavArrival(): boolean {
  return peekSoftNav();
}
