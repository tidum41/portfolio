"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PlayerRef } from "@remotion/player";
import Link from "next/link";
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
import { CONTROL_GROUPS, fieldDisplayValue, fieldHintSuffix, type ControlField } from "./control-groups";
import { JoolaFilmPlayer } from "./JoolaFilmPlayer";

const COMP_W = 1920;
const COMP_H = 1440;
const CARD_W = 676;
const FPS = 30;

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}
function getViewportWidth() {
  return typeof window !== "undefined" ? window.innerWidth : 1024;
}

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
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string | null;
  onChange: (n: number) => void;
}) {
  return (
    <label id={id} className="flex flex-col gap-1 text-xs text-neutral-600">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="tabular-nums text-neutral-900">
          {step < 1 ? value.toFixed(2) : value}
          {hint ? <span className="text-neutral-400 ml-1">({hint})</span> : null}
        </span>
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
      <Num label="Centre X (px)" value={shot.cx} min={200} max={1100} onChange={(cx) => onChange({ ...shot, cx })} id={`${prefix}-cx`} />
      <Num label="Centre Y (px)" value={shot.cy} min={80} max={600} onChange={(cy) => onChange({ ...shot, cy })} id={`${prefix}-cy`} />
      <Num label="Zoom (×)" value={shot.s} min={1} max={2.5} step={0.01} onChange={(s) => onChange({ ...shot, s })} id={`${prefix}-s`} />
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

function renderField(
  field: ControlField,
  config: FilmConfig,
  duration: number,
  patch: (fn: (c: FilmConfig) => FilmConfig) => void,
  easingOpts: typeof EASING_OPTIONS,
) {
  if (field.kind === "morph") {
    return (
      <div key={field.id} id={field.id} className="space-y-2">
        <Num
          id="morph-start"
          label={field.labelStart}
          value={config.morph[0]}
          min={0}
          max={40}
          hint={`${(config.morph[0] / FPS).toFixed(2)}s`}
          onChange={(n) => patch((c) => ({ ...c, morph: [n, c.morph[1]] }))}
        />
        <Num
          id="morph-end"
          label={field.labelEnd}
          value={config.morph[1]}
          min={4}
          max={80}
          hint={`${(config.morph[1] / FPS).toFixed(2)}s`}
          onChange={(n) => patch((c) => ({ ...c, morph: [c.morph[0], n] }))}
        />
      </div>
    );
  }
  if (field.kind === "easing") {
    const opts = easingOpts.filter((o) =>
      field.options === "cursor" ? true : ["camera", "move", "inOut", "ui", "easeOut"].includes(o.value),
    );
    return (
      <label key={field.id} id={field.id} className="text-xs text-neutral-600 flex flex-col gap-1">
        {field.label}
        <select
          className="border border-neutral-200 rounded-md px-2 py-1.5 text-sm bg-white"
          value={field.get(config)}
          onChange={(e) => patch((c) => field.set(c, e.target.value as EasingPreset))}
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    );
  }
  if (field.kind === "shot") {
    const shot = config.camera[field.shotKey] as { cx: number; cy: number; s: number };
    if (typeof shot !== "object" || shot === null) return null;
    return (
      <ShotEditor
        key={field.id}
        title={field.title}
        prefix={String(field.shotKey)}
        shot={shot}
        onChange={(s) => patch((c) => ({ ...c, camera: { ...c.camera, [field.shotKey]: s } }))}
      />
    );
  }
  const display = fieldDisplayValue(field, config);
  const hint = fieldHintSuffix(field, config);
  const min = field.min ?? 0;
  const max = field.max ?? (field.kind === "frames" ? duration : 3);
  const step = field.kind === "seconds" ? (field.step ?? 0.03) : 1;
  return (
    <Num
      key={field.id}
      id={field.id}
      label={field.label}
      value={display}
      min={min}
      max={max}
      step={step}
      hint={hint}
      onChange={(v) => patch((c) => (field.kind === "seconds" ? field.set(c, v) : field.set(c, Math.round(v))))}
    />
  );
}

export default function RemotionPlaygroundClient() {
  const [tab, setTab] = useState<"play" | "refs">("play");
  const [config, setConfig] = useState<FilmConfig>(DEFAULT_FILM_CONFIG);
  const [cardSize, setCardSize] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [frame, setFrame] = useState(0);
  const [reportMd, setReportMd] = useState("");
  const [assetOk, setAssetOk] = useState(true);
  const playerRef = useRef<PlayerRef>(null);
  const vw = useSyncExternalStore(subscribeResize, getViewportWidth, () => 1024);

  useEffect(() => {
    setConfig(loadStored());
    fetch("/motion-refs/report.md").then((r) => r.text()).then(setReportMd).catch(() => setReportMd(""));
    fetch("/joola-b2b/joola-logo.png", { method: "HEAD" })
      .then((r) => setAssetOk(r.ok))
      .catch(() => setAssetOk(false));
  }, []);

  const tl = useMemo(() => createTimelineState(config), [config]);
  const duration = tl.DURATION;
  const blocks = useMemo(() => beatBlocks(config), [config]);
  const previewW = cardSize ? Math.min(CARD_W, vw - 24) : Math.min(920, vw - 24);
  const previewH = Math.round(previewW * (COMP_H / COMP_W));

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const onFrame = ({ detail }: { detail: { frame: number } }) => setFrame(detail.frame);
    el.addEventListener("frameupdate", onFrame);
    return () => el.removeEventListener("frameupdate", onFrame);
  }, [duration, config, tab]);

  const patch = useCallback((fn: (c: FilmConfig) => FilmConfig) => {
    setConfig((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
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

  const header = (
    <header className="shrink-0 border-b border-neutral-200/80 bg-white/90 backdrop-blur px-3 py-2 flex flex-wrap items-center gap-2 justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">JOOLA film playground</p>
        <p className="text-[11px] text-neutral-500 hidden sm:block">Timings & camera — preview updates live</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs shrink-0">
        <Link href="/dev" className="text-neutral-500 hover:text-neutral-800 px-2 py-1">Dev</Link>
        <button type="button" onClick={() => setTab("play")} className={`px-3 py-1.5 rounded-full ${tab === "play" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}>
          Playground
        </button>
        <button type="button" onClick={() => setTab("refs")} className={`px-3 py-1.5 rounded-full ${tab === "refs" ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}>
          References
        </button>
      </div>
    </header>
  );

  if (tab === "refs") {
    return (
      <>
        {header}
        <main className="flex-1 min-h-0 overflow-y-auto px-3 py-4 max-w-5xl mx-auto w-full space-y-8">
          {REF_GALLERY.map((group) => (
            <section key={group.source}>
              <h2 className="text-sm font-semibold mb-2">{group.source}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.images.map((img) => (
                  <figure key={img.src} className="rounded-xl overflow-hidden border border-neutral-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.title} className="w-full h-auto" loading="lazy" />
                    <figcaption className="text-xs px-3 py-2 text-neutral-600">{img.title}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
          <section className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
            <h2 className="text-sm font-semibold mb-3">Motion spec (report.md)</h2>
            {reportMd ? <ReportMarkdown source={reportMd} /> : <p className="text-sm text-neutral-500">Loading…</p>}
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      {header}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        <section className="flex-1 min-h-0 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-neutral-200/80">
          <div className="shrink-0 px-3 py-2 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs bg-[#f5f4f1]">
            <label className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-2.5 py-1">
              <input type="checkbox" checked={cardSize} onChange={(e) => setCardSize(e.target.checked)} />
              676px card
            </label>
            <label className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 rounded-full px-2.5 py-1">
              <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
              Debug overlay
            </label>
            <span className="tabular-nums text-neutral-600">Frame {frame} / {duration - 1}</span>
            {!assetOk && (
              <span className="text-red-700">Assets missing — run prebuild or refresh after deploy</span>
            )}
          </div>

          <div className="shrink-0 flex justify-center px-2 pb-2 bg-[#f5f4f1]">
            <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm" style={{ width: previewW, height: previewH }}>
              <JoolaFilmPlayer
                ref={playerRef}
                filmConfig={config}
                durationInFrames={duration}
                fps={tl.FPS}
                width={previewW}
                height={previewH}
              />
              {overlay && <PreviewOverlay frame={frame} config={config} width={previewW} height={previewH} />}
            </div>
          </div>

          <div className="shrink-0 px-3 pb-3 bg-[#f5f4f1] space-y-1.5">
            <p className="text-[11px] font-medium text-neutral-600">Timeline</p>
            <div className="relative h-9 rounded-md overflow-hidden bg-neutral-100 border border-neutral-200/80">
              {blocks.map((b) => (
                <div
                  key={b.id}
                  title={b.label}
                  className="absolute top-0 bottom-0 text-[9px] sm:text-[10px] text-neutral-800/90 px-0.5 truncate flex items-center"
                  style={{
                    left: `${(b.start / duration) * 100}%`,
                    width: `${((b.end - b.start) / duration) * 100}%`,
                    background: b.color,
                  }}
                />
              ))}
              {clickFrames(config).map((c) => (
                <div
                  key={c.key}
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600/80"
                  style={{ left: `${(c.frame / duration) * 100}%` }}
                  title={c.label}
                />
              ))}
              <div className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 z-10" style={{ left: `${(frame / duration) * 100}%` }} />
            </div>
            <p className="text-xs sm:text-sm text-neutral-800 leading-snug line-clamp-2">
              <span className="text-neutral-500 text-[10px] uppercase tracking-wide mr-1.5">Now</span>
              {describeFrame(config, frame)}
            </p>
          </div>
        </section>

        <aside className="w-full lg:w-[min(360px,38vw)] shrink-0 overflow-y-auto bg-white px-3 py-3 space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs">
              Reset
            </button>
            <button type="button" onClick={copyJson} className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs">
              Copy JSON
            </button>
            <span className="text-[10px] text-neutral-500 self-center">Saved locally</span>
          </div>
          {CONTROL_GROUPS.map((group) => (
            <section key={group.title} className="border-t border-neutral-100 pt-3 space-y-2">
              <div>
                <p className="text-xs font-semibold text-neutral-900">{group.title}</p>
                <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">{group.hint}</p>
              </div>
              {group.fields.map((f) => renderField(f, config, duration, patch, EASING_OPTIONS))}
            </section>
          ))}
        </aside>
      </main>
    </>
  );
}
