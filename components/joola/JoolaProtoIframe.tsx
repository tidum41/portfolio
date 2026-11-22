"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import JoolaFigureSeg, { type SegOption } from "./JoolaFigureSeg";

export default function JoolaProtoIframe({
  figureId,
  src,
  designWidth,
  designHeight,
  caption,
  footer,
  onEmbedHeight,
}: {
  figureId: string;
  src: string;
  designWidth: number;
  designHeight: number;
  caption?: string;
  footer?: ReactNode;
  /** Parent merges heights for variant groups (reserved slot = max). */
  onEmbedHeight?: (height: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [liveHeight, setLiveHeight] = useState(designHeight);

  useEffect(() => {
    setLiveHeight(designHeight);
  }, [designHeight, src]);

  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "joola-embed-size" || typeof event.data.height !== "number")
        return;
      const win = iframeRef.current?.contentWindow;
      if (!win || event.source !== win) return;
      const h = Math.ceil(event.data.height);
      if (onEmbedHeight) onEmbedHeight(h);
      else setLiveHeight(Math.max(320, h));
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [onEmbedHeight]);

  const slotDesignHeight = onEmbedHeight ? designHeight : liveHeight;

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

  const slotHeight = slotDesignHeight * scale;

  return (
    <figure className="joola-proto-figure" data-joola-figure={figureId}>
      <div
        className="joola-proto-figure__chrome"
        ref={hostRef}
        style={{
          width: designWidth,
          maxWidth: "100%",
          minHeight: slotHeight,
          height: slotHeight,
          boxSizing: "content-box",
        }}
      >
        <div
          className="joola-proto-iframe-scale"
          style={{
            width: designWidth * scale,
            height: slotHeight,
            overflow: "hidden",
          }}
        >
          <iframe
            ref={iframeRef}
            title={figureId}
            src={src}
            data-joola-iframe
            data-joola-capture-root
            width={designWidth}
            height={slotDesignHeight}
            scrolling="no"
            style={{
              border: 0,
              display: "block",
              width: designWidth,
              height: slotDesignHeight,
              ...(scale < 0.999
                ? { transform: `scale(${scale})`, transformOrigin: "top left" }
                : {}),
            }}
          />
        </div>
      </div>
      {footer ? <div className="joola-proto-figure__footer">{footer}</div> : null}
      {caption ? <figcaption className="cs-figcaption">{caption}</figcaption> : null}
    </figure>
  );
}

export function JoolaProtoIframeSeg<T extends string>({
  label,
  value,
  options,
  onChange,
  buildSrc,
  figureId,
  designWidth,
  heights,
  caption,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
  buildSrc: (v: T) => string;
  figureId: string;
  designWidth: number;
  heights: Record<T, number>;
  caption?: string;
}) {
  const h = heights[value];
  return (
    <JoolaProtoIframe
      key={buildSrc(value)}
      figureId={figureId}
      src={buildSrc(value)}
      designWidth={designWidth}
      designHeight={h}
      caption={caption}
      footer={
        <JoolaFigureSeg label={label} value={value} options={options} onChange={onChange} />
      }
    />
  );
}
