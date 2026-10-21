"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dialogueExportSrc } from "@/lib/caseStudies/dialogueExportFrames";
import {
  reflowExportDocument,
  type ReflowMode,
} from "@/lib/dialogue/reflowExportDocument";

type Props = {
  exportRoute: string;
  title: string;
  assetId?: string;
  className?: string;
  reflowMode?: ReflowMode;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function exportHasLiveChat(doc: Document, mode: ReflowMode) {
  const panel = doc.querySelector("[data-export-popup-chat], [data-export-docked-chat], [data-export-chat-panel]");
  if (!panel) return false;
  const text = panel.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (text.length < 24) return false;
  if (/skeleton|loading/i.test(text)) return false;
  if (mode === "placement") {
    const docked = doc.querySelector("[data-export-docked-chat]");
    const popup = doc.querySelector("[data-export-popup-chat]");
    if (docked && docked.getBoundingClientRect().height < 80) return false;
    if (popup && popup.getBoundingClientRect().height < 60) return false;
  }
  return true;
}

async function waitForExportContent(doc: Document, mode: ReflowMode) {
  for (let i = 0; i < 80; i++) {
    if (mode === "hero-fill") {
      const hero =
        doc.querySelector<HTMLElement>("[data-export-hero-compose]") ??
        doc.querySelector<HTMLElement>("[data-export-app-shell]");
      if (hero && hero.offsetWidth > 80) return;
    }
    if (exportHasLiveChat(doc, mode)) return;
    const fallback =
      mode === "placement"
        ? doc.querySelector("[data-export-app-shell]")
        : doc.querySelector("[data-export-chat-panel], [data-export-hero-compose], [data-testid='viz-card']");
    if (fallback && i > 30) return;
    await sleep(100);
  }
}

export default function DialogueReactFigure({
  exportRoute,
  title,
  assetId,
  className,
  reflowMode = "default",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(320);
  const [mounted, setMounted] = useState(false);
  const lastWidthRef = useRef(0);

  const applyReflow = useCallback(
    async (force = false) => {
      const iframe = iframeRef.current;
      const container = containerRef.current;
      if (!iframe || !container) return;
      const doc = iframe.contentDocument;
      if (!doc) return;
      const w = container.clientWidth;
      if (w <= 0) return;
      if (!force && Math.abs(w - lastWidthRef.current) < 2 && iframe.dataset.reflowed === "1") {
        return;
      }
      await waitForExportContent(doc, reflowMode);
      if (reflowMode === "placement") {
        doc.querySelector<HTMLElement>("[data-export-chat-launcher-open]")?.click();
        doc.querySelector<HTMLElement>("[data-export-chat-launcher]")?.click();
        await sleep(300);
      }
      lastWidthRef.current = w;
      const nextH = reflowExportDocument(doc, w, reflowMode, exportRoute);
      iframe.dataset.reflowed = "1";
      if (reflowMode === "hero-fill") {
        setHeight(Math.max(Math.round(w * (2 / 3)), 200));
      } else {
        setHeight(Math.max(nextH + 12, 140));
      }
    },
    [exportRoute, reflowMode],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setMounted(true);
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      lastWidthRef.current = 0;
      void applyReflow(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyReflow]);

  const onIframeLoad = useCallback(() => {
    void (async () => {
      await applyReflow(true);
      await sleep(400);
      await applyReflow(true);
    })();
  }, [applyReflow]);

  return (
    <div
      ref={containerRef}
      className={["dialogue-react-figure", className].filter(Boolean).join(" ")}
      data-dialogue-asset-id={assetId}
      data-dialogue-reflow-mode={reflowMode}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          src={dialogueExportSrc(exportRoute)}
          title={title}
          className="dialogue-react-figure__iframe"
          onLoad={onIframeLoad}
          style={{ width: "100%", height, border: 0, display: "block" }}
          scrolling="no"
          tabIndex={-1}
        />
      ) : (
        <div className="dialogue-react-figure__skeleton" aria-hidden="true" />
      )}
    </div>
  );
}
