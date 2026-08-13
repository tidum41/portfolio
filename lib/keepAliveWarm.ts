/**
 * Pre-mount keep-alive About/Archive shells before the first click lands,
 * so the destination is a display toggle instead of a blank first paint.
 */

const ABOUT = "keep-alive-warm-about";
const ARCHIVE = "keep-alive-warm-archive";

let aboutWarmed = false;
let archiveWarmed = false;

export function wasAboutWarmed() {
  return aboutWarmed;
}

export function wasArchiveWarmed() {
  return archiveWarmed;
}

export function warmAboutShell() {
  if (typeof window === "undefined") return;
  aboutWarmed = true;
  window.dispatchEvent(new Event(ABOUT));
}

export function warmArchiveShell() {
  if (typeof window === "undefined") return;
  archiveWarmed = true;
  window.dispatchEvent(new Event(ARCHIVE));
}

export function onWarmAbout(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (aboutWarmed) cb();
  window.addEventListener(ABOUT, cb);
  return () => window.removeEventListener(ABOUT, cb);
}

export function onWarmArchive(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (archiveWarmed) cb();
  window.addEventListener(ARCHIVE, cb);
  return () => window.removeEventListener(ARCHIVE, cb);
}
