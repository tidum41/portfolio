"use client";

import { useCallback, useEffect, useState } from "react";
import DialogueThumbnailDemo from "@/components/dialogue/product/thumbnail/DialogueThumbnailDemo";

type SelVariant = "sel-1" | "sel-2" | "sel-3" | "sel-4" | "sel-5";

const VARIANTS: {
  id: SelVariant;
  name: string;
  recipe: string;
  watch: string;
}[] = [
  {
    id: "sel-1",
    name: "Outer ink, tinted row",
    recipe:
      "The combination with the outline moved outside the segment, where it sits on the panel instead of inside the data. The row fill is the segment's tint, bled 12px past the text padding.",
    watch: "Whether the outline reads as selection at first glance now that it frames the segment from outside.",
  },
  {
    id: "sel-2",
    name: "Outer tonal, tinted row",
    recipe:
      "The same build with the outline in each segment's own deep tone, its press colour, instead of ink.",
    watch: "Whether the softer outline still reads, especially around the stone segment where the tone is quiet.",
  },
  {
    id: "sel-3",
    name: "Offset ring, neutral row",
    recipe:
      "The outline floats off the segment behind a surface gap, the focus-ring pattern. The row fill is the product's warm neutral instead of the tint.",
    watch: "Whether the gap makes the selection feel calmer, or just adds a second edge to parse.",
  },
  {
    id: "sel-4",
    name: "Outer ink, no row fill",
    recipe:
      "The outline outside and the voice icon coloured, with the legend row left plain. The control for the fill.",
    watch: "Whether the row fill was doing real work, or the outline plus icon carry it alone.",
  },
  {
    id: "sel-5",
    name: "Percent on hover",
    recipe:
      "Variant 1, plus the product's own hover swap switched on here only: hovering a segment shows its share in place of its count, in the loop's hover beats and under your own cursor.",
    watch: "Whether the swap fights the selected row's fill, the conflict the counts rule exists to avoid on the card.",
  },
];

export default function ThumbnailStatesPlaygroundPage() {
  const [index, setIndex] = useState(0);
  const [mountKey, setMountKey] = useState(0);
  const [playing, setPlaying] = useState(true);

  const pick = useCallback((i: number) => {
    setIndex(i);
    setMountKey((k) => k + 1);
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(i + 1));
    window.history.replaceState(null, "", url);
  }, []);

  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("v"));
    if (Number.isInteger(v) && v >= 1 && v <= VARIANTS.length) pick(v - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= VARIANTS.length) pick(n - 1);
      if (e.key === "r" || e.key === "R") setMountKey((k) => k + 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pick]);

  const active = VARIANTS[index];

  const btnStyle: React.CSSProperties = {
    height: 32,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    color: "var(--color-text)",
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", fontFamily: "var(--font-sans)" }}>
      <p style={{ margin: "0 0 8px", color: "var(--color-text-muted)", fontSize: "var(--fs-caption)" }}>
        Dev only. The live component, not a recording.
      </p>
      <h1 style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 500 }}>Thumbnail selection prototypes</h1>
      <p style={{ margin: "0 0 24px", maxWidth: 640, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
        Five versions of the selected state, one at a time at full size, switched instantly. Every version
        moves the outline to the segment&apos;s outer edge and colours the quote&apos;s voice icon with the
        open side. Keys 1 to 5 switch, R replays the loop, space pauses. The pick rides in the URL.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {VARIANTS.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => pick(i)}
            style={{
              ...btnStyle,
              ...(i === index
                ? { background: "var(--color-text)", color: "var(--color-surface)", borderColor: "var(--color-text)" }
                : {}),
            }}
          >
            {i + 1} · {v.name}
          </button>
        ))}
        <button type="button" onClick={() => setMountKey((k) => k + 1)} style={btnStyle}>
          Replay
        </button>
        <button type="button" onClick={() => setPlaying((p) => !p)} style={btnStyle}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div style={{ background: "#101214", borderRadius: 16, padding: "28px 16px 20px" }}>
        <div style={{ width: 520, maxWidth: "92%", height: 360, margin: "0 auto", borderRadius: 12, overflow: "hidden" }}>
          <DialogueThumbnailDemo
            key={mountKey}
            variant="tight"
            selVariant={active.id}
            playing={playing}
          />
        </div>
      </div>

      <div style={{ marginTop: 20, maxWidth: 640 }}>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 500 }}>
          {index + 1} · {active.name}
        </p>
        <p style={{ margin: "0 0 6px", lineHeight: 1.5, color: "var(--color-text-secondary)", fontSize: 13 }}>
          {active.recipe}
        </p>
        <p style={{ margin: 0, lineHeight: 1.5, color: "var(--color-text-muted)", fontSize: 13 }}>
          Watch for: {active.watch}
        </p>
      </div>
    </main>
  );
}
