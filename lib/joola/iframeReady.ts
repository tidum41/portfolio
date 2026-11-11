/** Same-origin embed document has rendered prototype chrome. */
export function iframeDocLooksReady(doc: Document | null | undefined): boolean {
  if (!doc) return false;
  return Boolean(doc.querySelector(".buyer-shell, [data-qo-ready], .aq"));
}
