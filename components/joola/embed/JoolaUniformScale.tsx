"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Uniform scale so a fixed design width (e.g. 1280px portal) fits the case-study
 * column without reflow — keeps 1:1 with the Vite prototype.
 */
export default function JoolaUniformScale({
  designWidth,
  children,
}: {
  designWidth: number;
  children: ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const measure = () => {
      const host = innerRef.current?.parentElement;
      const inner = innerRef.current;
      if (!host || !inner) return;
      const nextScale = Math.min(1, host.clientWidth / designWidth);
      setScale(nextScale);
      setHeight(inner.offsetHeight * nextScale);
    };
    measure();
    const onHost = innerRef.current?.parentElement;
    const roHost = onHost ? new ResizeObserver(measure) : null;
    const roInner = innerRef.current ? new ResizeObserver(measure) : null;
    if (onHost && roHost) roHost.observe(onHost);
    if (innerRef.current && roInner) roInner.observe(innerRef.current);
  window.addEventListener("resize", measure);
    return () => {
      roHost?.disconnect();
      roInner?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [designWidth]);

  return (
    <div
      className="joola-uniform-scale"
      style={{
        height: height ?? "auto",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: designWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
