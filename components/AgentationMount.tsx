"use client";

import { useEffect } from "react";
import { Agentation } from "agentation";
import { isEditableTarget } from "@/lib/isEditableTarget";

/**
 * Preview/dev-only toolbar host. Imported only through AgentationSlot's
 * production-dead branch so production client bundles never see this module.
 */
const KEY_EVENTS = ["keydown", "keypress", "keyup"] as const;

function isTypedCharacter(e: KeyboardEvent) {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}

export default function AgentationMount() {
  // Single-letter shortcuts from other tools (the Vercel preview toolbar binds
  // "c") listen on window or document and ignore shadow DOM, so they eat keys
  // typed in the comment box. Typed characters from the toolbar are stopped
  // here, in the capture phase before those handlers. Enter, Escape, Tab and
  // chorded keys still propagate so Agentation's own handlers keep working.
  useEffect(() => {
    const guard = (e: Event) => {
      const k = e as KeyboardEvent;
      if (!isTypedCharacter(k) || !isEditableTarget(k)) return;
      if (!k.composedPath().some((n) => n instanceof Element && n.tagName === "AGENTATION-TOOLBAR")) return;
      k.stopImmediatePropagation();
    };
    for (const t of KEY_EVENTS) window.addEventListener(t, guard, true);
    return () => {
      for (const t of KEY_EVENTS) window.removeEventListener(t, guard, true);
    };
  }, []);

  return (
    <Agentation
      appName="muditm"
      identifyingAttributes={[
        "data-annotate",
        "data-testid",
        "data-test",
        "data-qa",
        "data-cy",
        "data-component",
      ]}
    />
  );
}
