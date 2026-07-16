// Flag used by the case-study "Back" control to signal that the upcoming
// navigation should skip page-transition/reveal animations and instead
// restore scroll position instantly, like a native browser back.
const KEY = "instant-back";

export function markInstantBack() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, "1");
}

export function peekInstantBack(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function clearInstantBack() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
