"use client";

import { useEffect, useRef, useState } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import DlgDemoCursor from "@/components/DlgDemoCursor";
import { QUOTE_LIST, QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";
import {
  DEFAULT_THUMBNAIL_VARIANT,
  THUMBNAIL_VARIANTS,
  thumbnailBarStyleForVariant,
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
const CURSOR_LEAD_MS = 200;
const CURSOR_LEAD_X = 70;
const CURSOR_OUT_MS = 300;
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

function ThumbPeople({ side }: { side: Side }) {
  const rows = side === "friday" ? FRIDAY_QUOTES : UNSURE_QUOTES;
  const [lead, next] = rows;
  const more = (side === "friday" ? 225 : 75) - rows.length;
  return (
    <>
      <div className="dp-sources dlg-thumb__sources">
        <SourcePill name={lead.participant} time={startOf(lead.time)} selected />
        <SourcePill name={next.participant} time={startOf(next.time)} />
        <SourcePill name={`+${more} more`} time="" />
      </div>
      <div className="dp-clip-quotes dlg-thumb__quote">
        <ThumbQuote q={lead} />
      </div>
    </>
  );
}

export default function DialogueThumbnailDemo({
  variant = DEFAULT_THUMBNAIL_VARIANT,
  playing = true,
  showPreview = true,
}: {
  variant?: ThumbnailVariantId;
  playing?: boolean;
  showPreview?: boolean;
}) {
  const timing = THUMBNAIL_VARIANTS[variant];
  const barStyle = thumbnailBarStyleForVariant(variant);
  const rootRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<Selection>("none");
  const [hover, setHover] = useState<Side | null>(null);
  const [press, setPress] = useState<Side | null>(null);
  const [cursorOn, setCursorOn] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [beat, setBeat] = useState("poster");
  const [swapKey, setSwapKey] = useState(0);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
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

    const openSide = (which: Side) => {
      setSide(which);
      setSwapKey((n) => n + 1);
    };

    const loop = async () => {
      while (!cancelled) {
        setBeat("poster");
        setSide("none");
        setHover(null);
        setPress(null);
        setPressing(false);
        setCursorOn(false);
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
        await wait(timing.payoffMs);
        if (cancelled) return;
        await fadeOut();
      }
    };

    void loop();
    return () => {
      cancelled = true;
      waits.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
    };
  }, [playing, timing]);

  return (
    <div
      ref={rootRef}
      className="dlg-thumb"
      data-variant={variant}
      data-bar-style={barStyle}
      data-beat={beat}
      data-side={side}
      data-cursor={cursorOn ? "on" : undefined}
      style={{ ["--thumb-scale" as string]: String(scale) }}
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
                data-hover={hover || undefined}
                data-press={press || undefined}
                data-side={side}
              >
                <ChartStackedBar lanes total={300} segments={THUMB_STACK} />
              </div>
              {/* The swap region is always mounted: it reserves the people's
                  height in the none state, so the panel surface is the same
                  size in every state. Only its contents wait for a side. */}
              <div key={swapKey} className="dlg-thumb__swap">
                {side !== "none" ? <ThumbPeople side={side} /> : null}
              </div>
            </ChartVizCard>
          </div>
        </div>
      </div>
      <div
        className="dlg-thumb__cursor dlg-cursor"
        data-on={cursorOn ? "" : undefined}
        data-down={pressing ? "" : undefined}
        aria-hidden
      >
        <DlgDemoCursor />
      </div>
    </div>
  );
}
