"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDialKit } from "dialkit";
import DialogueThumbnailDemo from "@/components/dialogue/product/thumbnail/DialogueThumbnailDemo";
import {
  THUMBNAIL_VARIANTS,
  thumbnailLoopDuration,
  thumbnailPhases,
  type ThumbnailTiming,
} from "@/components/dialogue/product/thumbnail/variants";

const BASE = THUMBNAIL_VARIANTS.tight;
/** The inspection grid: one frame is 40ms, the demo's 25 fps recording rate. */
const FRAME_MS = 40;

const STAGE_BG: Record<string, string> = {
  dark: "#0e0e10",
  warm: "#f1eeea",
  paper: "#fcfbf9",
};

export default function DialogueThumbnailPlaygroundPage() {
  const dk = useDialKit("Thumbnail playground", {
    timing: {
      rest: [BASE.restMs, 0, 1000, 10],
      move: [BASE.moveMs, 0, 1000, 10],
      hover: [BASE.hoverMs, 0, 500, 10],
      press: [BASE.pressMs, 0, 500, 10],
      payoff: [BASE.payoffMs, 0, 3000, 50],
    },
    fills: {
      hoverFocal: [85, 0, 100, 1],
      pressFocal: [70, 0, 100, 1],
      hoverNeutral: [80, 0, 100, 1],
      pressNeutral: [65, 0, 100, 1],
      easeMs: [100, 0, 300, 10],
    },
    view: {
      speed: [1, 0.1, 2, 0.05],
      loop: true,
      stage: { type: "select", options: ["dark", "warm", "paper"], default: "dark" },
    },
  });

  const timingOverride = useMemo<Partial<ThumbnailTiming>>(
    () => ({
      restMs: dk.timing.rest,
      moveMs: dk.timing.move,
      hoverMs: dk.timing.hover,
      pressMs: dk.timing.press,
      payoffMs: dk.timing.payoff,
    }),
    [dk.timing.rest, dk.timing.move, dk.timing.hover, dk.timing.press, dk.timing.payoff],
  );
  const effective = useMemo(() => ({ ...BASE, ...timingOverride }), [timingOverride]);
  const duration = thumbnailLoopDuration(effective);
  const phases = useMemo(() => thumbnailPhases(effective), [effective]);

  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timeRef = useRef(0);

  const seek = (t: number) => {
    const clamped = Math.max(0, Math.min(duration - 1, t));
    timeRef.current = clamped;
    setTimeMs(clamped);
  };

  const speed = dk.view.speed;
  const loop = dk.view.loop;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) * speed;
      last = now;
      let t = timeRef.current + dt;
      if (t >= duration) {
        if (loop) t %= duration;
        else {
          t = duration - 1;
          setPlaying(false);
        }
      }
      timeRef.current = t;
      setTimeMs(t);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, speed, loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === "ArrowLeft") seek(timeRef.current - (e.shiftKey ? FRAME_MS * 10 : FRAME_MS));
      if (e.key === "ArrowRight") seek(timeRef.current + (e.shiftKey ? FRAME_MS * 10 : FRAME_MS));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const dialVars = {
    "--dlg-thumb-hover-focal": `${dk.fills.hoverFocal}%`,
    "--dlg-thumb-press-focal": `${dk.fills.pressFocal}%`,
    "--dlg-thumb-hover-neutral": `${dk.fills.hoverNeutral}%`,
    "--dlg-thumb-press-neutral": `${dk.fills.pressNeutral}%`,
    "--dlg-thumb-ease": `${dk.fills.easeMs}ms`,
  } as React.CSSProperties;

  const shown = timeMs % duration;
  const frameNo = Math.floor(shown / FRAME_MS) + 1;
  const frameTotal = Math.ceil(duration / FRAME_MS);
  const current = phases.find((p) => shown >= p.start && shown < p.end) ?? phases[0];
  const stageBg = STAGE_BG[dk.view.stage] ?? STAGE_BG.dark;

  const btnStyle: React.CSSProperties = {
    height: 32,
    minWidth: 32,
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
      <h1 style={{ margin: "0 0 16px", fontSize: 24, fontWeight: 500 }}>Thumbnail video playground</h1>
      <p style={{ margin: "0 0 24px", maxWidth: 640, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
        The DialogueThumbnailDemo itself, driven by a deterministic timeline, so every frame is the real
        component at full quality. The DialKit panel tunes its actual timing and fill values; the defaults
        are the tight variant&apos;s shipped values.
      </p>

      <div style={{ ...dialVars, background: stageBg, borderRadius: 16, padding: "28px 16px 20px", transition: "background 200ms" }}>
        <div style={{ width: 520, maxWidth: "92%", height: 360, margin: "0 auto", borderRadius: 12, overflow: "hidden" }}>
          <DialogueThumbnailDemo variant="tight" timingOverride={timingOverride} timeMs={shown} />
        </div>

        <div style={{ width: 520, maxWidth: "92%", margin: "18px auto 0" }}>
          <div style={{ display: "flex", gap: 2, height: 22, marginBottom: 10 }}>
            {phases.map((p) => (
              <button
                key={`${p.beat}-${p.start}`}
                onClick={() => seek(p.start)}
                title={`${p.label} · ${p.start}–${p.end} ms`}
                style={{
                  flexGrow: Math.max(1, p.end - p.start),
                  border: 0,
                  borderRadius: 5,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  background: p === current ? "var(--color-text)" : "rgba(140,140,150,0.35)",
                  color: p === current ? stageBg : "inherit",
                  opacity: p === current ? 1 : 0.75,
                }}
              >
                {p.end - p.start >= 300 ? p.label : ""}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={btnStyle} onClick={(e) => seek(timeRef.current - (e.shiftKey ? FRAME_MS * 10 : FRAME_MS))} title="Previous frame">
              ‹
            </button>
            <button style={{ ...btnStyle, minWidth: 64, fontWeight: 500 }} onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </button>
            <button style={btnStyle} onClick={(e) => seek(timeRef.current + (e.shiftKey ? FRAME_MS * 10 : FRAME_MS))} title="Next frame">
              ›
            </button>
            <input
              type="range"
              min={0}
              max={duration - 1}
              step={1}
              value={Math.floor(shown)}
              onChange={(e) => seek(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#b43f7f" }}
              aria-label="Scrub the loop"
            />
            <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", minWidth: 210, textAlign: "right" }}>
              Frame {frameNo} / {frameTotal} · {(shown / 1000).toFixed(2)}s · {current.label}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ margin: "32px 0 4px", fontSize: 16, fontWeight: 500 }}>Beats, in frames</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--color-text-secondary)" }}>
        Each still is the live component pinned at that beat&apos;s midpoint. Select one to jump the stage to it.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {phases.map((p) => {
          const mid = p.start + (p.end - p.start) / 2;
          const f0 = Math.floor(p.start / FRAME_MS) + 1;
          const f1 = Math.max(f0, Math.ceil(p.end / FRAME_MS));
          return (
            <button
              key={`still-${p.beat}-${p.start}`}
              onClick={() => seek(mid)}
              style={{
                ...dialVars,
                width: 264,
                padding: 10,
                borderRadius: 12,
                border: p === current ? "2px solid #b43f7f" : "1px solid var(--color-border)",
                background: stageBg,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "block", height: 150, borderRadius: 8, overflow: "hidden" }}>
                <DialogueThumbnailDemo variant="tight" timingOverride={timingOverride} timeMs={mid} showPreview={false} />
              </span>
              <span style={{ display: "block", marginTop: 8, fontSize: 12, fontWeight: 500 }}>
                {p.label}
                <span style={{ float: "right", fontWeight: 400, opacity: 0.6, fontVariantNumeric: "tabular-nums" }}>
                  frames {f0}–{f1}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
