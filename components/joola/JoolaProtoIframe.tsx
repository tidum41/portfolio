"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import JoolaFigureSeg, { type SegOption } from "./JoolaFigureSeg";

export default function JoolaProtoIframe({
  figureId,
  src,
  designWidth,
  designHeight,
  caption,
  footer,
}: {
  figureId: string;
  src: string;
  designWidth: number;
  designHeight: number;
  caption?: string;
  footer?: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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

  const slotHeight = designHeight * scale;

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
            title={figureId}
            src={src}
            data-joola-iframe
            data-joola-capture-root
            width={designWidth}
            height={designHeight}
            scrolling="no"
            style={{
              border: 0,
              display: "block",
              width: designWidth,
              height: designHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
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
