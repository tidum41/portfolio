/**
 * Run `cb` after the browser has painted a real frame (double-rAF), with a
 * timeout fallback so a cancelled rAF cannot leave UI stuck invisible.
 */
export function afterPaint(cb: () => void, fallbackMs = 48): () => void {
  let cancelled = false;
  let id2 = 0;
  const id1 = requestAnimationFrame(() => {
    id2 = requestAnimationFrame(() => {
      if (!cancelled) cb();
    });
  });
  const fallback = window.setTimeout(() => {
    if (!cancelled) cb();
  }, fallbackMs);
  return () => {
    cancelled = true;
    cancelAnimationFrame(id1);
    cancelAnimationFrame(id2);
    window.clearTimeout(fallback);
  };
}
