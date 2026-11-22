const ROOTS = [".buyer-shell", ".admin-shell", "[data-qo-ready]"] as const;

function findRoot(): HTMLElement | null {
  for (const sel of ROOTS) {
    const el = document.querySelector(sel);
    if (el instanceof HTMLElement) return el;
  }
  return null;
}

/** Notify parent portfolio iframe of content height (embed mode only). */
export function attachEmbedHeightReporter() {
  if (!document.documentElement.classList.contains("is-embed")) return () => {};

  let last = 0;
  let readyPosted = false;
  const post = (h: number) => {
    const height = Math.ceil(h);
    if (height === last) return;
    last = height;
    window.parent.postMessage(
      { type: "joola-embed-size", height },
      window.location.origin,
    );
    if (!readyPosted && height > 0) {
      readyPosted = true;
      window.parent.postMessage({ type: "joola-embed-ready" }, window.location.origin);
    }
  };

  const measure = () => {
    const root = findRoot();
    if (!root) return;
    post(root.getBoundingClientRect().height);
  };

  measure();
  const ro = new ResizeObserver(() => measure());
  const root = findRoot();
  if (root) ro.observe(root);
  window.addEventListener("load", measure);

  const t = window.setInterval(measure, 400);
  return () => {
    ro.disconnect();
    window.clearInterval(t);
  };
}
