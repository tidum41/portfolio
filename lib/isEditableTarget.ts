const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const TOOLBAR_HOSTS = new Set(["AGENTATION-TOOLBAR"]);

function isEditableNode(node: EventTarget | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (EDITABLE_TAGS.has(node.tagName) || node.isContentEditable) return true;
  if (node.getAttribute("contenteditable") === "" || node.getAttribute("contenteditable") === "true") return true;
  return TOOLBAR_HOSTS.has(node.tagName) || node.hasAttribute("data-agentation-portal");
}

/**
 * True when a key event comes from something the user types into, or from the
 * Agentation toolbar. Checks the whole composedPath, because inside a shadow
 * root event.target is retargeted to the host element.
 */
export function isEditableTarget(e: Event): boolean {
  const path = typeof e.composedPath === "function" ? e.composedPath() : [];
  if (path.length === 0) return isEditableNode(e.target);
  return path.some(isEditableNode);
}
