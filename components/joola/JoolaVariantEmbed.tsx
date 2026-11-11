"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import JoolaEmbedSkeleton from "./JoolaEmbedSkeleton";
import JoolaFigureSeg, { type SegOption } from "./JoolaFigureSeg";
import { shouldShowSkeleton } from "@/lib/joola/embedVariantState";
import { useEmbedVariants } from "@/lib/joola/useEmbedVariants";

export default function JoolaVariantEmbed<T extends string>({
  label,
  value,
  options,
  onChange,
  buildSrc,
  figureId,
  designWidth,
  heights,
  caption,
  onEmbedHeight,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  buildSrc: (v: T) => string;
  figureId: string;
  designWidth: number;
  heights: Partial<Record<T, number>> & Record<string, number>;
  caption?: string;
  onEmbedHeight?: (height: number) => void;
}) {
  const variantIds = options.map((o) => o.value);
  const { state, onIframeLoad, onEmbedMessage, retry, pick } = useEmbedVariants({
    variants: variantIds,
    selected: value,
    onSelect: onChange,
  });

  const slotHeight = Math.max(
    ...variantIds.map((v) => heights[v as T] ?? heights[value] ?? 600),
  );
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      for (const v of variantIds) {
        const win = iframeRefs.current[v]?.contentWindow;
        if (win && event.source === win) {
          if (event.data?.type === "joola-embed-size" && typeof event.data.height === "number") {
            const h = Math.ceil(event.data.height);
            onEmbedHeight?.(h);
          }
          onEmbedMessage(v, event.data);
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [onEmbedMessage, onEmbedHeight, variantIds]);

  useLayoutEffect(() => {
    const measure = () => {
      const host = hostRef.current;
      if (!host) return;
      setScale(Math.min(1, host.clientWidth / designWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (hostRef.current) ro.observe(hostRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [designWidth]);

  const slotH = (onEmbedHeight ? slotHeight : slotHeight) * scale;

  return (
    <figure className="joola-proto-figure" data-joola-figure={figureId}>
      <div
        className="joola-proto-figure__chrome"
        ref={hostRef}
        style={{
          width: designWidth,
          maxWidth: "100%",
          minHeight: slotH,
          height: slotH,
          boxSizing: "content-box",
        }}
      >
        <div
          className="joola-proto-iframe-scale joola-variant-stack"
          style={{
            width: designWidth * scale,
            height: slotH,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {variantIds.map((v) => {
            const active = v === value;
            const src = buildSrc(v as T);
            const showSk = shouldShowSkeleton(state, v) && active;
            const h = heights[v as T] ?? slotHeight;
            return (
              <div
                key={v}
                className="joola-variant-stack__layer"
                style={{
                  position: active ? "relative" : "absolute",
                  inset: active ? undefined : 0,
                  visibility: active ? "visible" : "hidden",
                  opacity: active ? 1 : 0,
                  pointerEvents: active ? "auto" : "none",
                  width: designWidth,
                  height: h * scale,
                }}
              >
                {showSk ? (
                  <JoolaEmbedSkeleton
                    figureId={figureId}
                    designWidth={designWidth}
                    designHeight={h}
                  />
                ) : null}
                {state.byVariant[v] === "error" && active ? (
                  <div className="joola-embed-error">
                    <p>Prototype preview did not load.</p>
                    <button type="button" onClick={retry}>
                      Retry
                    </button>
                  </div>
                ) : null}
                <iframe
                  ref={(el) => {
                    iframeRefs.current[v] = el;
                  }}
                  title={`${figureId}-${v}`}
                  src={src}
                  data-joola-iframe
                  data-joola-variant={v}
                  width={designWidth}
                  height={h}
                  scrolling="no"
                  onLoad={() => onIframeLoad(v)}
                  style={{
                    border: 0,
                    display: showSk ? "none" : "block",
                    width: designWidth,
                    height: h,
                    ...(scale < 0.999
                      ? { transform: `scale(${scale})`, transformOrigin: "top left" }
                      : {}),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="joola-proto-figure__footer joola-proto-figure__footer--center">
        <JoolaFigureSeg label={label} value={value} options={options} onChange={pick} />
      </div>
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}
