/**
 * Case-study iframe mode (`cs=1`): hover-only — no click, focus, selection, or in-embed navigation.
 */
const BLOCK_TYPES = [
  "click",
  "mousedown",
  "pointerdown",
  "keydown",
  "submit",
  "focusin",
  "dragstart",
] as const;

const FOCUSABLE =
  'a[href], button, input, textarea, select, summary, [tabindex]:not([tabindex="-1"])';

function blockEvent(event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function onFocusIn(event: Event) {
  const target = event.target;
  if (target instanceof HTMLElement) target.blur();
  blockEvent(event);
}

function pinFocusables(root: ParentNode) {
  for (const el of root.querySelectorAll(FOCUSABLE)) {
  if (el instanceof HTMLElement) el.setAttribute("tabindex", "-1");
  }
}

export function attachCaseStudyEmbedMode(): () => void {
  const onRoot = (handler: (e: Event) => void) => (e: Event) => {
    if (!(e.target instanceof Node) || !document.documentElement.contains(e.target)) return;
    handler(e);
  };

  document.documentElement.classList.add("is-cs-embed");

  const blockers = BLOCK_TYPES.map((type) => {
    const fn =
      type === "focusin"
        ? onFocusIn
        : (event: Event) => blockEvent(event);
    const wrapped = onRoot(fn);
    document.addEventListener(type, wrapped, true);
    return { type, wrapped };
  });

  pinFocusables(document);
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        for (const node of m.addedNodes) {
          if (node instanceof Element) pinFocusables(node);
        }
      }
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    for (const { type, wrapped } of blockers) {
      document.removeEventListener(type, wrapped, true);
    }
    observer.disconnect();
    document.documentElement.classList.remove("is-cs-embed");
  };
}

export function caseStudyEmbedFromSearch(params: URLSearchParams): boolean {
  return params.get("cs") === "1";
}
