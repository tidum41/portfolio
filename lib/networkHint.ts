/**
 * Hints from the Network Information API. Safari doesn't implement it;
 * a missing API is treated as a normal connection so those browsers still
 * warm the next page. saveData, 2g, and 3g opt out.
 */

type NetInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

function connection(): NetInfo | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { connection?: NetInfo };
  return nav.connection ?? null;
}

/** Slow, metered, or offline. Unknown API → false. */
export function constrainedNetwork(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.onLine === false) return true;
  const info = connection();
  if (!info) return false;
  if (info.saveData) return true;
  const kind = info.effectiveType;
  return kind === "slow-2g" || kind === "2g" || kind === "3g";
}

/** Background work (About album art, archive) after the intro. */
export function allowIdlePrefetch(): boolean {
  return !constrainedNetwork();
}

/**
 * How early an off-screen video may start loading.
 * A fast flick still reaches the next row on a normal connection.
 * On a tight connection the file waits until it is close.
 */
export function warmRootMargin(): string {
  return constrainedNetwork() ? "160px 0px" : "70% 0px";
}
