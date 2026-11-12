"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
  captions,
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
  captions: Partial<Record<T, string>> & { default?: string };
  onEmbedHeight?: (variant: T, height: number) => void;
}) {
  const variantIds = options.map((o) => o.value);
  const { state, onIframeLoad, onEmbedMessage, retry, pick } = useEmbedVariants({
    variants: variantIds,
    selected: value,
    onSelect: onChange,
  });

  const activeHeight = heights[value as T] ?? 600;
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const onEmbedHeightRef = useRef(onEmbedHeight);
  const onEmbedMessageRef = useRef(onEmbedMessage);
  const onIframeLoadRef = useRef(onIframeLoad);
  const buildSrcRef = useRef(buildSrc);
  const [scale, setScale] = useState(1);
  const [srcByVariant, setSrcByVariant] = useState<Record<string, string>>({});

  onEmbedHeightRef.current = onEmbedHeight;
  onEmbedMessageRef.current = onEmbedMessage;
  onIframeLoadRef.current = onIframeLoad;
  buildSrcRef.current = buildSrc;

  useLayoutEffect(() => {
    const variantList = variantIds;
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      for (const v of variantList) {
        const win = iframeRefs.current[v]?.contentWindow;
        if (win && event.source === win) {
          if (
            event.data?.type === "joola-embed-size" &&
            typeof event.data.height === "number"
          ) {
            onEmbedHeightRef.current?.(v as T, Math.ceil(event.data.height));
          }
          onEmbedMessageRef.current(v, event.data);
        }
      }
    };
    window.addEventListener("message", onMsg);
    setSrcByVariant(
      Object.fromEntries(variantList.map((v) => [v, buildSrcRef.current(v as T)])),
    );
    return () => window.removeEventListener("message", onMsg);
  }, [variantIds.join(",")]);

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

  const slotH = activeHeight * scale;
  const captionText = captions[value as T] ?? captions.default ?? "";

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
            const src = srcByVariant[v];
            const showSk = shouldShowSkeleton(state, v) && active;
            const h = heights[v as T] ?? activeHeight;
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
                  loading="eager"
                  data-joola-iframe
                  data-joola-variant={v}
                  width={designWidth}
                  height={h}
                  scrolling="no"
                  onLoad={(e) =>
                    onIframeLoadRef.current(v, e.currentTarget)
                  }
                  style={{
                    border: 0,
                    display: "block",
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
      {captionText ? (
        <figcaption className="cs-figcaption">{captionText}</figcaption>
      ) : null}
    </figure>
  );
}
