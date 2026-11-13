"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import DlgDemoCursor from "@/components/DlgDemoCursor";
import { QUOTE_LIST, QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";
import {
  DEFAULT_THUMBNAIL_VARIANT,
  THUMBNAIL_CURSOR_LEAD_MS,
  THUMBNAIL_CURSOR_OUT_MS,
  THUMBNAIL_VARIANTS,
  THUMBNAIL_ENTER_TOTAL_MS,
  THUMBNAIL_CLEAR_MS,
  thumbnailBarStyleForVariant,
  thumbnailClearProgress,
  thumbnailEnterProgress,
  thumbnailStateAt,
  type ThumbnailTiming,
  type ThumbnailVariantId,
} from "@/components/dialogue/product/thumbnail/variants";
import { withThumbnailBarRamp } from "@/components/dialogue/product/thumbnail/thumbnailBarRamp";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/product/thumbnail/dialogue-thumbnail.css";

/** Canonical finding, MOCK-DATA.md §4d / live split card. */
const FINDING =
  "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday, whatever day they ordered.";
const PANEL = 448;

const THUMB_STACK = withThumbnailBarRamp([
  { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
  { label: "Unsure", value: 75, display: "75 of 300" },
]);

/** Same ease-in-out the /dialogue motion recorder uses. */
const EASE_IO = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
const CURSOR_BOW = 0.08;
const CURSOR_LEAD_MS = THUMBNAIL_CURSOR_LEAD_MS;
const CURSOR_LEAD_X = 70;
const CURSOR_OUT_MS = THUMBNAIL_CURSOR_OUT_MS;
const CURSOR_HOT_X = 3;
const CURSOR_HOT_Y = 2;

type Side = "friday" | "unsure";
/** A side, or nothing chosen yet: the bar and legend show, no people. */
type Selection = Side | "none";
type Quote = { participant: string; time: string; quote: string };

/** 225 lead: Dev, QUOTE_LIST_FRIDAY / MOCK-DATA.md §4c. Ana stays as the second pill. */
const FRIDAY_QUOTES: Quote[] = [QUOTE_LIST_FRIDAY[1], QUOTE_LIST_FRIDAY[0]];

/**
 * 75 lead: Owen's existing-mock line from MOCK-DATA.md §4c, not the shortened
 * sampleData QUOTE_LIST wording. Mei remains the second pill.
 */
const OWEN_QUOTE: Quote = {
  participant: "Owen",
  time: "07:12\u201307:30",
  quote: "I'd assume Friday after I order, so I checked the date.",
};
const UNSURE_QUOTES: Quote[] = [OWEN_QUOTE, QUOTE_LIST[0]];

function startOf(time: string) {
  return time.split(/[\u2013-]/)[0];
}

function clipLen(time: string) {
  const sec = (t: string) => t.split(":").reduce((a, n) => a * 60 + Number(n), 0);
  const [a, z] = time.split(/[\u2013-]/).map(sec);
  const s = z - a;
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function ThumbQuote({ q }: { q: Quote }) {
  return (
    <div className="dp-clip-quote">
      <p className="dp-clip-quote__who">
        <WaveformIcon className="dp-clip-quote__icon" />
        <span className="dp-clip-quote__name">{q.participant}</span>
        <span className="dp-clip-quote__time">{q.time}</span>
        <span className="dlg-thumb__dur">{clipLen(q.time)}</span>
      </p>
      <p className="dp-clip-quote__text">{q.quote}</p>
    </div>
  );
}

function ThumbPeople({
  side,
  enter,
  exit,
}: {
  side: Side;
  /**
   * Scrub mode only: eased entrance progress for the loop's first open.
   * Autoplay runs the same entrance as a CSS animation instead (the swap
   * carries data-enter), so it passes null here.
   */
  enter?: { chips: number; quote: number } | null;
  /**
   * Eased clearing progress 0..1 for the loop's end, in both modes: the
   * people leave as one gesture along the entrance's path, reversed.
   */
  exit?: number | null;
}) {
  const rows = side === "friday" ? FRIDAY_QUOTES : UNSURE_QUOTES;
  const [lead, next] = rows;
  const more = (side === "friday" ? 225 : 75) - rows.length;
  const rise = (p: number): React.CSSProperties =>
    p >= 1 ? {} : { opacity: p, transform: `translateY(${6 * (1 - p)}px)` };
  const sink = (p: number): React.CSSProperties =>
    p <= 0 ? {} : { opacity: 1 - p, transform: `translateY(${6 * p}px)` };
  return (
    <>
      <div
        className="dp-sources dlg-thumb__sources"
        style={enter ? rise(enter.chips) : exit != null ? sink(exit) : undefined}
      >
        <SourcePill name={lead.participant} time={startOf(lead.time)} selected />
        <SourcePill name={next.participant} time={startOf(next.time)} />
        <SourcePill name={`+${more} more`} time="" />
      </div>
      <div
        className="dp-clip-quotes dlg-thumb__quote"
        style={enter ? rise(enter.quote) : exit != null ? sink(exit) : undefined}
      >
        <ThumbQuote q={lead} />
      </div>
    </>
  );
}

type Pt = { x: number; y: number };

export default function DialogueThumbnailDemo({
  variant = DEFAULT_THUMBNAIL_VARIANT,
  playing = true,
  showPreview = true,
  timeMs = null,
  timingOverride,
  selVariant,
}: {
  variant?: ThumbnailVariantId;
  playing?: boolean;
  showPreview?: boolean;
  /**
   * Selection-state prototype variant (dev states playground only, the
   * /prototype method: numbered versions behind a switcher). Unset keeps
   * the shipped states treatment.
   */
  selVariant?: "sel-1" | "sel-2" | "sel-3" | "sel-4" | "sel-5" | "sel-6" | "sel-7";
  /**
   * Scrub mode: when set, the demo renders the exact state at this loop time
   * (see thumbnailStateAt) and the autoplay loop never runs. Null = autoplay.
   */
  timeMs?: number | null;
  /** Partial timing overrides over the variant's beats, for tuning tools. */
  timingOverride?: Partial<ThumbnailTiming>;
}) {
  const timing = useMemo<ThumbnailTiming>(
    () => ({ ...THUMBNAIL_VARIANTS[variant], ...(timingOverride ?? {}) }),
    [variant, timingOverride],
  );
  const barStyle = thumbnailBarStyleForVariant(variant);
  const rootRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<Selection>("none");
  const [hover, setHover] = useState<Side | null>(null);
  const [press, setPress] = useState<Side | null>(null);
  const [cursorOn, setCursorOn] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [beat, setBeat] = useState("poster");
  const [swapKey, setSwapKey] = useState(0);
  /** Autoplay: true only while the loop's first open is on screen. */
  const [enterFirst, setEnterFirst] = useState(false);
  /** Autoplay: the loop's clearing, with its eased progress 0..1. */
  const [clearing, setClearing] = useState(false);
  const [exitP, setExitP] = useState(0);
  const enterArmedRef = useRef(true);
  const [scale, setScale] = useState(1);
  const [targets, setTargets] = useState<{ friday: Pt; unsure: Pt } | null>(null);

  const scrubbing = timeMs != null;
  const frame = scrubbing ? thumbnailStateAt(timing, timeMs) : null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const s = Math.min(1, Math.max(0.4, (w - 48) / PANEL));
      setScale(Number.isFinite(s) ? s : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Scrub mode needs the segment centres as data, so the cursor position can
     be computed from time alone instead of measured mid-flight. */
  useEffect(() => {
    if (!scrubbing) return;
    const root = rootRef.current;
    if (!root) return;
    const point = (which: Side): Pt => {
      const sel =
        which === "friday"
          ? '.dp-chart-stack__seg[data-focal]'
          : '.dp-chart-stack__seg:not([data-focal])';
      const el = root.querySelector<HTMLElement>(sel);
      const box = root.getBoundingClientRect();
      if (!el || box.width === 0 || box.height === 0) {
        return { x: which === "unsure" ? 320 : 160, y: 90 };
      }
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width * 0.5 - box.left, y: r.top + r.height * 0.1 - box.top };
    };
    const measureTargets = () =>
      setTargets({ friday: point("friday"), unsure: point("unsure") });
    measureTargets();
    const id = window.setTimeout(measureTargets, 350);
    return () => window.clearTimeout(id);
  }, [scrubbing, scale]);

  useEffect(() => {
    if (scrubbing) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playing || reduced) {
      setSide("none");
      setHover(null);
      setPress(null);
      setCursorOn(false);
      setPressing(false);
      setBeat("poster");
      setClearing(false);
      setExitP(0);
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    const waits: number[] = [];
    const rafs: number[] = [];
    const pos = { x: 0, y: 0 };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        waits.push(id);
      });

    const setCursor = (x: number, y: number) => {
      pos.x = x;
      pos.y = y;
      root.style.setProperty("--cursor-x", `${x - CURSOR_HOT_X}px`);
      root.style.setProperty("--cursor-y", `${y - CURSOR_HOT_Y}px`);
    };

    const targetPoint = (which: Side) => {
      const sel =
        which === "friday"
          ? '.dp-chart-stack__seg[data-focal]'
          : '.dp-chart-stack__seg:not([data-focal])';
      const el = root.querySelector<HTMLElement>(sel);
      const box = root.getBoundingClientRect();
      if (!el || box.width === 0 || box.height === 0) {
        return { x: which === "unsure" ? 320 : 160, y: 90 };
      }
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width * 0.5 - box.left,
        y: r.top + r.height * 0.1 - box.top,
      };
    };

    const moveTo = (which: Side, ms: number) =>
      new Promise<void>((resolve) => {
        const from = { ...pos };
        const started = performance.now();
        const step = (now: number) => {
          if (cancelled) return;
          const to = targetPoint(which);
          const p = Math.min(1, (now - started) / ms);
          const e = EASE_IO(p);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const b = Math.sin(Math.PI * e) * CURSOR_BOW;
          setCursor(from.x + dx * e - dy * b, from.y + dy * e + dx * b);
          if (p < 1) rafs.push(requestAnimationFrame(step));
        };
        rafs.push(requestAnimationFrame(step));
        const id = window.setTimeout(resolve, ms);
        waits.push(id);
      });

    const fadeInNear = async (which: Side) => {
      const to = targetPoint(which);
      setCursor(to.x + CURSOR_LEAD_X, to.y);
      setCursorOn(true);
      await wait(CURSOR_LEAD_MS);
    };

    const fadeOut = async () => {
      setCursorOn(false);
      await wait(CURSOR_OUT_MS);
    };

    /* The clearing, mirroring thumbnailStateAt: the bar's selection
       releases at once (its frame eases out on the segment transition)
       while the people fade over THUMBNAIL_CLEAR_MS on the entrance ease. */
    const animateClear = () =>
      new Promise<void>((resolve) => {
        const started = performance.now();
        const step = (now: number) => {
          if (cancelled) return;
          const p = Math.min(1, (now - started) / THUMBNAIL_CLEAR_MS);
          setExitP(thumbnailClearProgress(p * THUMBNAIL_CLEAR_MS));
          if (p < 1) rafs.push(requestAnimationFrame(step));
          else resolve();
        };
        rafs.push(requestAnimationFrame(step));
      });

    const openSide = (which: Side) => {
      setSide(which);
      setSwapKey((n) => n + 1);
      /* Only the loop's first open plays the answer's entrance: the swap
         mounts with data-enter and the CSS animation runs. A switch lands
         whole. The entrance re-arms when the loop returns to none. */
      if (barStyle === "states" && enterArmedRef.current) {
        enterArmedRef.current = false;
        setEnterFirst(true);
      } else {
        setEnterFirst(false);
      }
    };

    const loop = async () => {
      while (!cancelled) {
        setBeat("poster");
        setSide("none");
        setHover(null);
        setPress(null);
        setPressing(false);
        setCursorOn(false);
        enterArmedRef.current = true;
        setEnterFirst(false);
        await wait(timing.restMs);
        if (cancelled) return;
        setBeat("move-unsure");
        await fadeInNear("unsure");
        if (cancelled) return;
        await moveTo("unsure", timing.moveMs);
        if (cancelled) return;
        setBeat("hover-unsure");
        setHover("unsure");
        await wait(timing.hoverMs);
        if (cancelled) return;
        setBeat("press-unsure");
        setPress("unsure");
        setPressing(true);
        await wait(timing.pressMs);
        if (cancelled) return;
        setPress(null);
        setHover(null);
        setPressing(false);
        openSide("unsure");
        setBeat("unsure");
        await wait(timing.payoffMs);
        if (cancelled) return;
        setBeat("move-friday");
        await moveTo("friday", timing.moveMs);
        if (cancelled) return;
        setBeat("hover-friday");
        setHover("friday");
        await wait(timing.hoverMs);
        if (cancelled) return;
        setBeat("press-friday");
        setPress("friday");
        setPressing(true);
        await wait(timing.pressMs);
        if (cancelled) return;
        setPress(null);
        setHover(null);
        setPressing(false);
        openSide("friday");
        setBeat("poster");
        await wait(timing.payoffMs - THUMBNAIL_CLEAR_MS);
        if (cancelled) return;
        setClearing(true);
        await animateClear();
        if (cancelled) return;
        setSide("none");
        setClearing(false);
        setExitP(0);
        await fadeOut();
      }
    };

    void loop();
    return () => {
      cancelled = true;
      waits.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
    };
  }, [playing, timing, scrubbing]);

  /* In scrub mode every rendered value comes from the frame state; in
     autoplay it comes from the loop's state, exactly as before. */
  /* The clearing splits the render in two: the bar already reads as
     unselected (its frame is easing out) while the people are still on
     screen, leaving. Both modes read the same split. */
  const rClear: number | null = frame
    ? frame.clearMs != null
      ? thumbnailClearProgress(frame.clearMs)
      : null
    : clearing
      ? exitP
      : null;
  const rBarSide: Selection = frame
    ? frame.clearMs != null
      ? "none"
      : frame.side
    : clearing
      ? "none"
      : side;
  const rPeopleSide: Selection = frame ? frame.side : clearing ? "friday" : side;
  const rBeat = frame ? frame.beat : beat;
  const rHover = frame ? frame.hover : hover;
  const rPress = frame ? frame.press : press;
  const rCursorOn = frame ? frame.cursorOn : cursorOn;
  const rPressing = frame ? frame.pressing : pressing;
  /* Scrub mode computes the first open's entrance from the frame state.
     Autoplay passes null and runs the same entrance as a CSS animation. */
  const rEnter =
    frame && frame.enterMs != null && frame.enterMs < THUMBNAIL_ENTER_TOTAL_MS && barStyle === "states"
      ? thumbnailEnterProgress(frame.enterMs)
      : null;

  const bowTo = (a: Pt, b: Pt, p: number): Pt => {
    const e = EASE_IO(p);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const bow = Math.sin(Math.PI * e) * CURSOR_BOW;
    return { x: a.x + dx * e - dy * bow, y: a.y + dy * e + dx * bow };
  };

  let cursorVars: Record<string, string> = {};
  if (frame) {
    const F = targets?.friday ?? { x: 160, y: 90 };
    const U = targets?.unsure ?? { x: 320, y: 90 };
    const leadU: Pt = { x: U.x + CURSOR_LEAD_X, y: U.y };
    let pos = F;
    if (frame.cursorMode === "lead-unsure") pos = leadU;
    else if (frame.cursorMode === "to-unsure") pos = bowTo(leadU, U, frame.cursorP);
    else if (frame.cursorMode === "at-unsure") pos = U;
    else if (frame.cursorMode === "to-friday") pos = bowTo(U, F, frame.cursorP);
    cursorVars = {
      "--cursor-x": `${pos.x - CURSOR_HOT_X}px`,
      "--cursor-y": `${pos.y - CURSOR_HOT_Y}px`,
    };
  }

  return (
    <div
      ref={rootRef}
      className="dlg-thumb"
      data-variant={variant}
      data-bar-style={barStyle}
      data-sel-variant={selVariant}
      data-beat={rBeat}
      data-side={rBarSide}
      data-scrub={scrubbing ? "" : undefined}
      data-cursor={rCursorOn ? "on" : undefined}
      style={{ "--thumb-scale": String(scale), ...cursorVars } as React.CSSProperties}
    >
      {showPreview ? <span className="dlg-thumb__preview">Preview</span> : null}
      <div className="dlg-thumb__stage">
        <div className="dlg-thumb__scale">
          <div
            className={`dialogue-product-root dlg-live dlg-thumb__panel dp-chat-panel-typography ${dialogueProductFontClassName}`}
          >
            <ChartVizCard title={FINDING}>
              <div
                className="dlg-live__bar dlg-thumb__bar"
                data-hover={rHover || undefined}
                data-press={rPress || undefined}
                data-side={rBarSide}
              >
                <ChartStackedBar lanes total={300} segments={THUMB_STACK} />
              </div>
              {/* The swap region is always mounted: it reserves the people's
                  height in the none state, so the panel surface is the same
                  size in every state. Only its contents wait for a side. */}
              <div
                key={frame ? `scrub-${rPeopleSide}` : swapKey}
                className="dlg-thumb__swap"
                data-enter={!frame && enterFirst ? "" : undefined}
              >
                {rPeopleSide !== "none" ? (
                  <ThumbPeople side={rPeopleSide} enter={rEnter} exit={rClear} />
                ) : null}
              </div>
            </ChartVizCard>
          </div>
        </div>
      </div>
      <div
        className="dlg-thumb__cursor dlg-cursor"
        data-on={rCursorOn ? "" : undefined}
        data-down={rPressing ? "" : undefined}
        aria-hidden
      >
        <DlgDemoCursor />
      </div>
    </div>
  );
}
