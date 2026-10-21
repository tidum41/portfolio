"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dialogueExportSrc } from "@/lib/caseStudies/dialogueExportFrames";
import { reflowExportDocument } from "@/lib/dialogue/reflowExportDocument";

type Props = {
  exportRoute: string;
  title: string;
  assetId?: string;
  className?: string;
};

/**
 * In-page Dialogue UI at the real column width: same-origin export document
 * reflowed inside a full-width iframe (no CSS transform scaling on the host).
 */
export default function DialogueReactFigure({
  exportRoute,
  title,
  assetId,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(280);
  const [mounted, setMounted] = useState(false);

  const lastWidthRef = useRef(0);

  const applyReflow = useCallback(() => {
    const iframe = iframeRef.current;
    const container = containerRef.current;
    if (!iframe || !container) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const w = container.clientWidth;
    if (w <= 0) return;
    if (Math.abs(w - lastWidthRef.current) < 2 && iframe.dataset.reflowed === "1") return;
    lastWidthRef.current = w;
    const nextH = reflowExportDocument(doc, w);
    iframe.dataset.reflowed = "1";
    setHeight(Math.max(nextH + 8, 120));
  }, []);

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
      if (iframeRef.current?.contentDocument) applyReflow();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyReflow]);

  return (
    <div
      ref={containerRef}
      className={["dialogue-react-figure", className].filter(Boolean).join(" ")}
      data-dialogue-asset-id={assetId}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          src={dialogueExportSrc(exportRoute)}
          title={title}
          className="dialogue-react-figure__iframe"
          onLoad={applyReflow}
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
