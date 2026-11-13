"use client";

import { useCallback, useEffect, useState } from "react";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import ContactSheet from "./directions/ContactSheet";
import Setlist from "./directions/Setlist";
import Turntable from "./directions/Turntable";
import { type LayoutId } from "./data";
import { isLayoutId } from "./layoutOptions";

export default function ArchiveLabClient() {
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<LayoutId>("contact");
  const onLayout = useCallback((next: LayoutId) => {
    setLayout((cur) => (cur === next ? cur : next));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture / agent helper: window event can force a layout without a hand-rolled UI.
  useEffect(() => {
    const onEvt = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (isLayoutId(id)) onLayout(id);
    };
    window.addEventListener("archive-lab-layout", onEvt as EventListener);
    return () => window.removeEventListener("archive-lab-layout", onEvt as EventListener);
  }, [onLayout]);

  // Site-wide dials share the singleton store. Keep only this lab's panels visible.
  useEffect(() => {
    if (!mounted) return;
    const keep = new Set(["Contact sheet", "Setlist", "Turntable"]);
    const prune = () => {
      document.querySelectorAll(".dialkit-panel .dialkit-folder-title").forEach((titleEl) => {
        const name = titleEl.textContent?.trim();
        if (!name) return;
        const folder = titleEl.closest(".dialkit-folder") as HTMLElement | null;
        if (!folder) return;
        const parentFolder = folder.parentElement?.closest(".dialkit-folder");
        const grandFolder = parentFolder?.parentElement?.closest(".dialkit-folder");
        // Top-level panel folders sit directly under the root DialKit folder.
        if (parentFolder && !grandFolder && !keep.has(name)) {
          folder.style.display = "none";
        }
      });
    };
    prune();
    const mo = new MutationObserver(prune);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [mounted, layout]);

  return (
    <>
      <style>{`
        .al-shell {
          min-height: 100vh;
          background:
            radial-gradient(1200px 600px at 20% -10%, color-mix(in srgb, var(--color-text-primary) 8%, transparent), transparent 60%),
            radial-gradient(900px 500px at 90% 10%, color-mix(in srgb, var(--color-text-primary) 5%, transparent), transparent 55%),
            var(--color-bg);
          color: var(--color-text-primary);
          font-family: var(--font-sans);
          padding: 88px var(--page-px, 24px) 120px;
          overflow-x: clip;
        }
        .al-shell a {
          color: inherit;
          text-underline-offset: 3px;
        }
        .al-intro-block {
          max-width: 34ch;
          margin-bottom: 36px;
        }
        .al-intro {
          font-family: var(--font-serif);
          font-size: clamp(26px, 3.2vw, 40px);
          line-height: 1.2;
          font-weight: 400;
          margin: 0;
        }
        .al-dir { position: relative; }

        .al-table {
          position: relative;
          min-height: min(72vh, 720px);
          margin: 0 auto;
          max-width: 920px;
          background:
            repeating-linear-gradient(
              90deg,
              color-mix(in srgb, var(--color-text-primary) 4%, transparent) 0 1px,
              transparent 1px 48px
            ),
            color-mix(in srgb, var(--color-text-primary) 3%, var(--color-bg));
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 10%, transparent);
          display: grid;
          place-items: center;
          touch-action: none;
        }
        .al-print {
          position: absolute;
          margin: 0;
          padding: 10px 10px 28px;
          background: #f3efe6;
          color: #1a1a1a;
          cursor: grab;
          user-select: none;
        }
        [data-theme="dark"] .al-print {
          background: #e7e1d4;
        }
        .al-print:active { cursor: grabbing; }
        .al-print-photo {
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #cfc8bb;
        }
        .al-print-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .al-print-caption {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 8px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
          letter-spacing: 0.01em;
          transform: rotate(-1.5deg);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .al-setlist-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .al-setlist-grid { grid-template-columns: 1fr; }
        }
        .al-poster, .al-spec {
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 14%, transparent);
          padding: 28px 24px 32px;
          background: color-mix(in srgb, var(--color-text-primary) 3%, var(--color-bg));
        }
        .al-poster-stamp {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.45;
          margin-bottom: 12px;
        }
        .al-poster-title {
          font-family: var(--font-serif);
          font-size: 34px;
          font-weight: 400;
          margin: 0 0 6px;
          line-height: 1.1;
        }
        .al-poster-sub {
          margin: 0 0 22px;
          font-size: 13px;
          opacity: 0.55;
        }
        .al-lines {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .al-line {
          width: 100%;
          display: grid;
          grid-template-columns: 3ch 1fr;
          gap: 14px;
          align-items: baseline;
          appearance: none;
          background: transparent;
          border: 0;
          border-top: 1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent);
          color: inherit;
          font: inherit;
          font-family: var(--font-serif);
          text-align: left;
          padding: 10px 0;
          cursor: pointer;
        }
        .al-line:hover, .al-line:focus-visible {
          background: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
        }
        .al-line-num {
          font-family: var(--font-sans);
          font-size: 12px;
          opacity: 0.4;
        }
        .al-line-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
          line-height: 1.15;
        }
        .al-line-meta {
          font-family: var(--font-sans);
          font-size: 12px;
          opacity: 0.5;
        }
        .al-spec-photos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 18px;
        }
        .al-spec-shot { margin: 0; }
        .al-spec-shot img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 12%, transparent);
        }
        .al-spec-shot figcaption {
          font-size: 11px;
          opacity: 0.5;
          margin-top: 4px;
        }
        .al-keygrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
        }
        .al-keycap {
          appearance: none;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 18%, transparent);
          background: color-mix(in srgb, var(--color-text-primary) 6%, var(--color-bg));
          color: inherit;
          font: inherit;
          font-size: 12px;
          min-height: 44px;
          border-radius: 6px;
          box-shadow: 0 2px 0 color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          cursor: pointer;
        }
        .al-follow {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 40;
          pointer-events: none;
          padding: 8px;
          background: #f3efe6;
          color: #1a1a1a;
          box-shadow: 0 18px 40px rgba(0,0,0,0.28);
        }
        .al-follow img {
          width: 100%;
          height: calc(100% - 22px);
          object-fit: cover;
          display: block;
        }
        .al-follow span {
          display: block;
          margin-top: 6px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
        }

        .al-orbit-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .al-orbit-toolbar button {
          appearance: none;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          color: inherit;
          font: inherit;
          font-size: 13px;
          min-height: 40px;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
        }
        .al-orbit-toolbar button.is-on {
          background: color-mix(in srgb, var(--color-text-primary) 10%, transparent);
        }
        .al-orbit-hint {
          font-size: 12px;
          opacity: 0.45;
          margin-left: 8px;
        }
        .al-orbit-stage {
          position: relative;
          min-height: min(70vh, 680px);
          display: grid;
          place-items: center;
        }
        .al-orbit-hero {
          position: relative;
          z-index: 5;
          width: min(42vw, 320px);
          text-align: center;
        }
        .al-orbit-hero img {
          width: 100%;
          aspect-ratio: 4 / 5;
          object-fit: cover;
          display: block;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 14%, transparent);
          box-shadow: 0 24px 50px rgba(0,0,0,0.28);
        }
        .al-orbit-hero figcaption {
          margin-top: 10px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 14px;
        }
        .al-orbit-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          translate: -50% -50%;
          pointer-events: none;
        }
        .al-orbit-item {
          position: absolute;
          left: 50%;
          top: 50%;
          margin: 0;
          padding: 0;
          border: 1px solid color-mix(in srgb, var(--color-text-primary) 16%, transparent);
          background: var(--color-bg);
          overflow: hidden;
          cursor: pointer;
          pointer-events: auto;
        }
        .al-orbit-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .al-orbit-item.is-active {
          outline: 1px solid color-mix(in srgb, var(--color-text-primary) 35%, transparent);
        }

        @media (prefers-reduced-motion: reduce) {
          .al-print, .al-follow, .al-orbit-item, .al-orbit-hero, .al-keycap {
            transition: none !important;
          }
        }
      `}</style>

      <div className="al-shell" data-archive-lab={layout}>
        {!mounted ? (
          <p className="al-intro">Loading lab…</p>
        ) : (
          <>
            {layout === "contact" ? <ContactSheet onLayout={onLayout} /> : null}
            {layout === "setlist" ? <Setlist onLayout={onLayout} /> : null}
            {layout === "turntable" ? <Turntable onLayout={onLayout} /> : null}
          </>
        )}
      </div>

      {mounted ? (
        <DialRoot position="top-right" productionEnabled defaultOpen />
      ) : null}
    </>
  );
}
