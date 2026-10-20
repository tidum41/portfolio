/**
 * One shared window touchstart listener for sticky-hover cleanup on nav
 * chrome. HalftoneNavLink instances subscribe instead of each attaching
 * their own listener.
 */

type ClearHover = () => void;

const subscribers = new Set<ClearHover>();
let attached = false;

function onTouchStart() {
  for (const clear of subscribers) clear();
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("touchstart", onTouchStart, { passive: true });
}

/** Subscribe a hover-clear callback. Returns unsubscribe. */
export function subscribeNavTouchClearHover(clear: ClearHover): () => void {
  ensureAttached();
  subscribers.add(clear);
  return () => {
    subscribers.delete(clear);
  };
}
