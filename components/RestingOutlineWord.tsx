"use client";

import { useEffect, useRef, useState } from "react";
import { readNavWordsSsr } from "./navWordsSsr";

/**
 * Resting nav letter: the same droplet outlines the morph uses at progress 0.
 * The path markup is written by the server render only (see navWordsSsr) and
 * kept through hydration, so it isn't repeated in the RSC payload. If this
 * ever mounts fresh on the client (no server markup), it draws the same
 * paths from the lazily loaded outline data.
 * Color is inherited so the client link can mark the current page.
 */
export default function RestingOutlineWord({
  label,
  width,
  height,
}: {
  label: string;
  width: number;
  height: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [html] = useState(() => readNavWordsSsr(label));
  const [paths, setPaths] = useState<readonly string[] | null>(null);

  useEffect(() => {
    if (svgRef.current?.childNodes.length) return;
    let cancelled = false;
    void import("./outlineMorphData").then(({ OUTLINE_WORDS }) => {
      const word = OUTLINE_WORDS.find((entry) => entry.label === label);
      if (!cancelled && word) setPaths(word.droplets.map((droplet) => droplet.start));
    });
    return () => {
      cancelled = true;
    };
  }, [label]);

  if (!width) return <span>{label}</span>;

  const svgProps = {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    "aria-hidden": true,
    style: { display: "block", overflow: "visible" },
  } as const;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height,
        color: "inherit",
      }}
    >
      {paths ? (
        <svg key="client" {...svgProps}>
          {paths.map((d, index) => (
            <path key={index} d={d} fill="currentColor" />
          ))}
        </svg>
      ) : (
        <svg
          key="server"
          ref={svgRef}
          {...svgProps}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </span>
  );
}
