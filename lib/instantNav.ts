/**
 * Motion contract — Instant vs Orchestrated
 * ==========================================
 * Layer A — route opacity (AnimationProvider):
 *   - Primary tabs never go through AnimatePresence. Case-study remounts
 *     skip the route fade via peekSkipRouteFade() on soft-nav / instant-back.
 *
 * Layer B — page content:
 *   - Work / About / Archive are keep-alive shells in the root layout.
 *     Hide with `display: none` + inert (never `visibility: hidden`).
 *     Visible tab is decided on the nav press (`markPrimaryShow`), then
 *     `router.push` syncs the URL. The shell is instant; content still
 *     plays its 8px / 1140ms enter on each primary-tab arrival.
 *   - Case-study Back snaps Work at rest (`markInstantBack`).
 *
 * Layer C — first-load intro (data-intro / IntroOrchestrator / HeroText /
 * PS3Silk):
 *   - Cold "/" and tab/BFCache intro-replay only. Never use it for an SPA
 *     soft return.
 *
 * Primary paths:
 *   Cold "/"                  → intro, then orchestrated grid
 *   work ↔ about ↔ archive    → tab switch this frame; content enters
 *   "/" → case study          → soft fade skip; narrative entrance
 *   case-study Back → "/"     → instant fade/content return
 *   case-study → "/" via nav  → tab show this frame; work content enters
 *   tab/BFCache return on "/" → distinct intro-replay
 */

const INSTANT_KEY = "instant-back";
const SOFT_KEY = "soft-nav";
const PRIMARY_TAB_EVENT = "primary-tab-show";

export type PrimaryTab = "work" | "about" | "archive";

const HREF_TO_TAB: Record<string, PrimaryTab> = {
  "/": "work",
  "/about": "about",
  "/archive": "archive",
};

export function hrefToPrimaryTab(href: string): PrimaryTab | null {
  const path = href.split("?")[0]?.split("#")[0] ?? "";
  return HREF_TO_TAB[path] ?? null;
}

export function pathnameToPrimaryTab(pathname: string): PrimaryTab | null {
  return HREF_TO_TAB[pathname] ?? null;
}

export function isPrimaryHref(href: string): boolean {
  return hrefToPrimaryTab(href) !== null;
}

/** Clicked a primary tab before Next.js flipped the pathname — paint now. */
let pendingTab: PrimaryTab | null = null;

function emitPrimaryTab() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PRIMARY_TAB_EVENT));
}

export function markPrimaryShow(tab: PrimaryTab) {
  pendingTab = tab;
  emitPrimaryTab();
}

export function peekPendingPrimaryTab(): PrimaryTab | null {
  return pendingTab;
}

export function clearPendingPrimaryTab() {
  if (pendingTab == null) return;
  pendingTab = null;
  emitPrimaryTab();
}

export function subscribePrimaryTab(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PRIMARY_TAB_EVENT, onStoreChange);
  return () => window.removeEventListener(PRIMARY_TAB_EVENT, onStoreChange);
}

/**
 * Pending tab wins until the URL catches up. `null` means a non-primary
 * route (case study, /dev, …) with no optimistic show in flight.
 */
export function resolvePrimaryTab(pathname: string): PrimaryTab | null {
  return pendingTab ?? pathnameToPrimaryTab(pathname);
}

/** Already showing this primary href (pending tab or committed URL). */
export function isAlreadyShowingPrimary(href: string, pathname: string): boolean {
  const tab = hrefToPrimaryTab(href);
  if (!tab) return false;
  return resolvePrimaryTab(pathname) === tab;
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

/** Keep-alive snap: case-study Back only. Primary-nav plays content enter. */
export function peekKeepAliveSnap(): boolean {
  return peekInstantBack();
}

/** Instant-back OR soft primary-nav — AnimationProvider skips the fade. */
export function peekSkipRouteFade(): boolean {
  return peekInstantBack() || peekSoftNav();
}

/** Work content snaps only on Case-study Back — not on Work/About/Archive tabs. */
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
