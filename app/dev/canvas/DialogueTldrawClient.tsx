"use client";

import { useCallback, useEffect, useRef } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import type { DialogueCanvasSection } from "@/lib/caseStudies/dialogueCanvas";
import type { DialogueImageSize } from "@/lib/caseStudies/dialogueCanvasImageMeta";
import {
  reseedDialogueBoard,
  seedDialogueTldrawBoard,
} from "./dialogueTldrawSeed";

const PERSISTENCE_KEY = "dialogue-canvas-v2";

type Props = {
  sections: DialogueCanvasSection[];
  imageMeta: Record<string, DialogueImageSize>;
};

export default function DialogueTldrawClient({ sections, imageMeta }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const footer = document.querySelector("footer");
    const prevFooterDisplay = footer instanceof HTMLElement ? footer.style.display : "";
    if (footer instanceof HTMLElement) footer.style.display = "none";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      if (footer instanceof HTMLElement) footer.style.display = prevFooterDisplay;
    };
  }, []);

  const tryInitialSeed = useCallback(
    (editor: Editor) => {
      if (seededRef.current) return;
      if (editor.getCurrentPageShapeIds().size > 0) {
        seededRef.current = true;
        return;
      }
      if (Object.keys(imageMeta).length === 0) return;
      seedDialogueTldrawBoard(editor, sections, imageMeta, window.location.origin);
      editor.zoomToFit({ animation: { duration: 0 } });
      seededRef.current = true;
    },
    [imageMeta, sections],
  );

  const onMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      const scheduleSeed = () => tryInitialSeed(editor);
      scheduleSeed();
      queueMicrotask(scheduleSeed);
      requestAnimationFrame(scheduleSeed);
      const unlisten = editor.store.listen(scheduleSeed, { scope: "document" });
      return () => {
        unlisten();
        editorRef.current = null;
      };
    },
    [tryInitialSeed],
  );

  const onReset = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    reseedDialogueBoard(editor, sections, imageMeta, window.location.origin);
  }, [imageMeta, sections]);

  return (
    <div
      className="dialogue-tldraw-shell"
      style={{
        position: "fixed",
        top: "var(--nav-h)",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 25,
      }}
    >
      <button
        type="button"
        onClick={onReset}
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          zIndex: 1000,
          padding: "6px 10px",
          fontSize: 12,
          borderRadius: 6,
          border: "1px solid var(--color-border-subtle, #ccc)",
          background: "rgba(255,255,255,0.92)",
          cursor: "pointer",
          fontFamily: "var(--font-sans, system-ui)",
        }}
      >
        Reset board
      </button>
      <Tldraw persistenceKey={PERSISTENCE_KEY} onMount={onMount} />
    </div>
  );
}
