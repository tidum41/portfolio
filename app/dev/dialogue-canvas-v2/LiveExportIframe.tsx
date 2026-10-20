"use client";

import { useLayoutEffect, useRef, useState } from "react";

type LiveExportIframeProps = {
  src: string;
  title: string;
  frameWidth: number;
  frameHeight: number;
};

export default function LiveExportIframe({ src, title, frameWidth, frameHeight }: LiveExportIframeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      setScale(width / frameWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth]);

  const scaledHeight = Math.round(frameHeight * scale);

  return (
    <div ref={viewportRef} className="dcv2-live__viewport" style={{ height: scaledHeight }}>
      <div
        className="dcv2-live__scale"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${scale})`,
        }}
      >
        <iframe
          src={src}
          title={title}
          className="dcv2-live__iframe"
          width={frameWidth}
          height={frameHeight}
          loading="lazy"
          scrolling="no"
        />
      </div>
    </div>
  );
}
