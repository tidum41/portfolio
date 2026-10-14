"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { JoolaB2B } from "@joola-remotion/JoolaB2B";
import {
  DEFAULT_FILM_CONFIG,
  mergeFilmConfig,
  type FilmConfig,
  type EasingPreset,
} from "@joola-remotion/joola/film-config";
import { createTimelineState } from "@joola-remotion/joola/timeline-state";
import { buildPointerData, toScreen } from "@joola-remotion/joola/pointer";
import { R } from "@joola-remotion/joola/proto-rects.generated";
import {
  STORAGE_KEY,
  EASING_OPTIONS,
  beatBlocks,
  clickFrames,
  describeFrame,
  REF_GALLERY,
} from "./playground-meta";
import { ReportMarkdown } from "./ReportMarkdown";

const COMP_W = 1920;
const COMP_H = 1440;
const CARD_W = 676;

function loadStored(): FilmConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILM_CONFIG;
    return mergeFilmConfig(JSON.parse(raw) as FilmConfig);
  } catch {
    return DEFAULT_FILM_CONFIG;
  }
}

function Num({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label id={id} className="flex flex-col gap-1 text-xs text-neutral-600">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">{step < 1 ? value.toFixed(2) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-neutral-900"
      />
    </label>
  );
}

function ShotEditor({
  title,
  shot,
  onChange,
  prefix,
}: {
  title: string;
  shot: { cx: number; cy: number; s: number };
  onChange: (s: { cx: number; cy: number; s: number }) => void;
  prefix: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3 space-y-2" id={`param-camera-${prefix}`}>
      <p className="text-xs font-medium text-neutral-800">{title}</p>
      <Num label="Center X" value={shot.cx} min={200} max={1100} onChange={(cx) => onChange({ ...shot, cx })} id={`${prefix}-cx`} />
      <Num label="Center Y" value={shot.cy} min={80} max={600} onChange={(cy) => onChange({ ...shot, cy })} id={`${prefix}-cy`} />
      <Num label="Zoom" value={shot.s} min={1} max={2.5} step={0.01} onChange={(s) => onChange({ ...shot, s })} id={`${prefix}-s`} />
    </div>
  );
}

function PreviewOverlay({
  frame,
  config,
  width,
  height,
}: {
  frame: number;
  config: FilmConfig;
  width: number;
  height: number;
}) {
  const tl = useMemo(() => createTimelineState(config), [config]);
  const ptr = useMemo(() => buildPointerData(tl), [tl]);
  const scale = width / COMP_W;
  const [px, py] = ptr.pointerAt(frame);
  const cam = tl.camAt(frame);
  const hw = tl.OW / 2 / cam.s;
  const hh = tl.OH / 2 / cam.s;
  const left = cam.cx - hw;
  const top = cam.cy - hh;
  const viewW = hw * 2;
  const viewH = hh * 2;
  const [vx, vy] = toScreen(cam, left, top, tl.OW, tl.OH);
  const pathPts = useMemo(() => {
    const pts: string[] = [];
    for (let f = tl.MORPH[1]; f <= Math.min(tl.END_FADE[0], frame); f += 2) {
      const [x, y] = ptr.pointerAt(f);
      const sx = (x / tl.OW) * COMP_W;
      const sy = (y / tl.OH) * COMP_H;
      pts.push(`${sx * scale},${sy * scale}`);
    }
    return pts.join(" ");
  }, [ptr, tl, frame, scale]);

  const clicks = clickFrames(config);
  const targets = ptr.CLICK_TARGETS.map(([k, rk]) => {
    const rect = R[rk];
    const [x1, y1] = toScreen(cam, rect[0], rect[1], tl.OW, tl.OH);
    const [x2, y2] = toScreen(cam, rect[0] + rect[2], rect[1] + rect[3], tl.OW, tl.OH);
    const kScale = COMP_W / tl.OW;
    return { key: k, x: x1 * kScale * scale, y: y1 * kScale * scale, w: (x2 - x1) * kScale * scale, h: (y2 - y1) * kScale * scale };
  });

  const camRect = {
    x: (vx / tl.OW) * COMP_W * scale,
    y: (vy / tl.OH) * COMP_H * scale,
    w: (viewW / tl.OW) * COMP_W * scale,
    h: (viewH / tl.OH) * COMP_H * scale,
  };

  return (
    <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
      <polyline points={pathPts} fill="none" stroke="rgba(37,99,235,0.55)" strokeWidth={2} strokeDasharray="4 3" />
      {targets.map((t) => (
        <rect key={t.key} x={t.x} y={t.y} width={t.w} height={t.h} fill="none" stroke="rgba(16,185,129,0.7)" strokeWidth={1.5} rx={3} />
      ))}
      {clicks.map((c) => {
        const [x, y] = ptr.pointerAt(c.frame);
        const sx = (x / tl.OW) * COMP_W * scale;
        const sy = (y / tl.OH) * COMP_H * scale;
        return <circle key={c.key} cx={sx} cy={sy} r={5} fill="rgba(239,68,68,0.85)" />;
      })}
      <rect x={camRect.x} y={camRect.y} width={camRect.w} height={camRect.h} fill="none" stroke="rgba(234,179,8,0.9)" strokeWidth={2} />
      <circle cx={(px / tl.OW) * COMP_W * scale} cy={(py / tl.OH) * COMP_H * scale} r={6} fill="rgba(0,0,0,0.75)" stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}

export default function RemotionPlaygroundClient() {
  const [tab, setTab] = useState<"play" | "refs">("play");
  const [config, setConfig] = useState<FilmConfig>(DEFAULT_FILM_CONFIG);
  const [cardSize, setCardSize] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [frame, setFrame] = useState(0);
  const [reportMd, setReportMd] = useState("");
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    setConfig(loadStored());
    fetch("/motion-refs/report.md").then((r) => r.text()).then(setReportMd);
  }, []);

  const tl = useMemo(() => createTimelineState(config), [config]);
  const duration = tl.DURATION;

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const onFrame = ({ detail }: { detail: { frame: number } }) => {
      setFrame(detail.frame);
    };
    el.addEventListener("frameupdate", onFrame);
    return () => el.removeEventListener("frameupdate", onFrame);
  }, [duration, config]);
  const blocks = useMemo(() => beatBlocks(config), [config]);
  const previewW = cardSize ? CARD_W : Math.min(920, typeof window !== "undefined" ? window.innerWidth - 48 : 920);
  const previewH = Math.round(previewW * (COMP_H / COMP_W));

  const patch = useCallback((fn: (c: FilmConfig) => FilmConfig) => {
    setConfig((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      return next;
    });
  }, []);

  const reset = () => {
    setConfig(DEFAULT_FILM_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    playerRef.current?.seekTo(0);
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#f5f4f1] text-neutral-900">
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3 justify-between sticky top-0 z-20">
        <div>
          <p className="text-sm font-medium">JOOLA B2B film — Remotion playground</p>
          <p className="text-xs text-neutral-500">Tweak timings & camera; preview updates instantly.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dev" className="text-neutral-500 hover:text-neutral-800">← Dev tools</Link>
          <button type="button" onClick={() => setTab("play")} className={`px-3 py-1.5 rounded-full ${tab === "play" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}>
            Playground
          </button>
          <button type="button" onClick={() => setTab("refs")} className={`px-3 py-1.5 rounded-full ${tab === "refs" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}>
            References
          </button>
        </div>
      </header>

      {tab === "refs" ? (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {REF_GALLERY.map((group) => (
            <section key={group.source}>
              <h2 className="text-sm font-semibold mb-3">{group.source}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.images.map((img) => (
                  <figure key={img.src} className="rounded-xl overflow-hidden border border-neutral-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.title} className="w-full h-auto" />
                    <figcaption className="text-xs px-3 py-2 text-neutral-600">{img.title}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
          <section className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-sm font-semibold mb-4">Motion spec (report.md)</h2>
            {reportMd ? <ReportMarkdown source={reportMd} /> : <p className="text-sm text-neutral-500">Loading…</p>}
          </section>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
                <input type="checkbox" checked={cardSize} onChange={(e) => setCardSize(e.target.checked)} />
                676px card preview
              </label>
              <label className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-3 py-1.5">
                <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
                Debug overlay (cursor path, clicks, camera)
              </label>
              <span className="tabular-nums text-neutral-600">Frame {frame} / {duration - 1}</span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm mx-auto" style={{ width: previewW }}>
              <Player
                key={`player-${duration}`}
                ref={playerRef}
                component={JoolaB2B}
                inputProps={{ filmConfig: config }}
                durationInFrames={duration}
                compositionWidth={COMP_W}
                compositionHeight={COMP_H}
                fps={tl.FPS}
                style={{ width: previewW, height: previewH }}
                controls
                loop
                clickToPlay
                spaceKeyToPlayOrPause
                acknowledgeRemotionLicense
              />
              {overlay && <PreviewOverlay frame={frame} config={config} width={previewW} height={previewH} />}
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-2">
              <p className="text-xs font-medium text-neutral-700">Timeline</p>
              <div className="relative h-10 rounded-md overflow-hidden bg-neutral-100">
                {blocks.map((b) => (
                  <div
                    key={b.id}
                    title={b.label}
                    className="absolute top-0 bottom-0 text-[10px] text-neutral-800/80 px-1 truncate flex items-center"
                    style={{
                      left: `${(b.start / duration) * 100}%`,
                      width: `${((b.end - b.start) / duration) * 100}%`,
                      background: b.color,
                    }}
                  >
                    {b.label}
                  </div>
                ))}
                {clickFrames(config).map((c) => (
                  <div
                    key={c.key}
                    className="absolute top-0 bottom-0 w-0.5 bg-red-600/80"
                    style={{ left: `${(c.frame / duration) * 100}%` }}
                    title={c.label}
                  />
                ))}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 z-10"
                  style={{ left: `${(frame / duration) * 100}%` }}
                />
              </div>
              <p className="text-sm text-neutral-800 leading-snug">
                <span className="text-neutral-500 text-xs uppercase tracking-wide mr-2">Now</span>
                {describeFrame(config, frame)}
              </p>
            </div>
          </section>

          <aside className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto text-sm">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={reset} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs">
                Reset
              </button>
              <button type="button" onClick={copyJson} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs">
                Copy config JSON
              </button>
              <span className="text-[11px] text-neutral-500 self-center">Auto-saved to localStorage</span>
            </div>

            <div id="param-morph" className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold">Logo intro morph</p>
              <Num label="Start frame" value={config.morph[0]} min={0} max={40} onChange={(n) => patch((c) => ({ ...c, morph: [n, c.morph[1]] }))} id="morph-start" />
              <Num label="End frame" value={config.morph[1]} min={4} max={60} onChange={(n) => patch((c) => ({ ...c, morph: [c.morph[0], n] }))} id="morph-end" />
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold">Cursor</p>
              <Num id="param-clickLead" label="Hover lead before click (frames)" value={config.clickLead} min={0} max={12} onChange={(n) => patch((c) => ({ ...c, clickLead: n }))} />
              <label className="text-xs text-neutral-600 flex flex-col gap-1">
                Travel easing
                <select
                  id="param-cursorMovePreset"
                  className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
                  value={config.cursorMovePreset}
                  onChange={(e) => patch((c) => ({ ...c, cursorMovePreset: e.target.value as EasingPreset }))}
                >
                  {EASING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold">Click frames</p>
              {(Object.keys(config.clicks) as (keyof FilmConfig["clicks"])[]).map((key) => (
                <Num
                  key={key}
                  id={`param-clicks-${key}`}
                  label={key}
                  value={config.clicks[key]}
                  min={0}
                  max={duration}
                  onChange={(n) => patch((c) => ({ ...c, clicks: { ...c.clicks, [key]: n } }))}
                />
              ))}
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold">Beat durations & holds</p>
              {(Object.keys(config.beats) as (keyof FilmConfig["beats"])[]).map((key) => (
                <Num
                  key={key}
                  id={`param-beats-${key}`}
                  label={key}
                  value={config.beats[key]}
                  min={0}
                  max={120}
                  onChange={(n) => patch((c) => ({ ...c, beats: { ...c.beats, [key]: n } }))}
                />
              ))}
            </div>

            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-xs font-semibold">Camera shots</p>
              <ShotEditor title="Shot A — search / table" prefix="shotA" shot={config.camera.shotA} onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, shotA: s } }))} />
              <ShotEditor title="Shot B — reorder rail" prefix="shotB" shot={config.camera.shotB} onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, shotB: s } }))} />
              <ShotEditor title="Shot B2 — footer + pill" prefix="shotB2" shot={config.camera.shotB2} onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, shotB2: s } }))} />
              <ShotEditor title="Cart summary" prefix="shotSummary" shot={config.camera.shotSummary} onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, shotSummary: s } }))} />
              <ShotEditor title="Order placed" prefix="shotOrderPlaced" shot={config.camera.shotOrderPlaced} onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, shotOrderPlaced: s } }))} />
              <label className="text-xs text-neutral-600 flex flex-col gap-1">
                Story pan easing
                <select
                  className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm"
                  value={config.camera.moveEasing}
                  onChange={(e) => patch((c) => ({ ...c, camera: { ...c.camera, moveEasing: e.target.value as EasingPreset } }))}
                >
                  {EASING_OPTIONS.filter((o) => ["camera", "move", "inOut", "ui", "easeOut"].includes(o.value)).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
}
