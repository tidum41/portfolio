"use client";

import { useEffect, useRef, useState } from "react";
import ChartStackedBar from "@/components/dialogue/product/chart/ChartStackedBar";
import ChartVizCard from "@/components/dialogue/product/chart/ChartVizCard";
import SourcePill from "@/components/dialogue/product/SourcePill";
import { WaveformIcon } from "@/components/dialogue/product/icons";
import { dialogueProductFontClassName } from "@/components/dialogue/product/fonts";
import { QUOTE_LIST, QUOTE_LIST_FRIDAY } from "@/lib/dialogue/product/sampleData";
import {
  DEFAULT_THUMBNAIL_VARIANT,
  THUMBNAIL_VARIANTS,
  type ThumbnailVariantId,
} from "@/components/dialogue/product/thumbnail/variants";
import "@/components/dialogue/product/dialogue-product.css";
import "@/components/dialogue/product/thumbnail/dialogue-thumbnail.css";

const FINDING = "225 of 300 shoppers read \u2018Arrives by Friday\u2019 as this Friday.";
const PANEL = 448;

type Side = "friday" | "unsure";
type Quote = { participant: string; time: string; quote: string };

const FRIDAY_QUOTES = QUOTE_LIST_FRIDAY;
const UNSURE_QUOTES = QUOTE_LIST;

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

function CursorArrow() {
  return (
    <svg viewBox="0 0 16 20" width="16" height="20" aria-hidden>
      <path
        d="M1.2 1.1v16.2l4.2-4.3 2.4 5.7 2.3-1-2.5-5.6h6.3z"
        fill="var(--dp-bg)"
        stroke="var(--dp-ink)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<Side>("friday");
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
      setSide("friday");
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

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        waits.push(id);
      });

    const targetPoint = (which: Side) => {
      const el = root.querySelector<HTMLElement>(".dp-chart-stack__bar");
      const box = root.getBoundingClientRect();
      if (!el || box.width === 0 || box.height === 0) return { x: which === "unsure" ? 72 : 40, y: 38 };
      const r = el.getBoundingClientRect();
      const friday = 225 / 300;
      const along = which === "friday" ? friday * 0.62 : friday + (1 - friday) * 0.55;
      return {
        x: ((r.left + r.width * along - box.left) / box.width) * 100,
        y: ((r.top + r.height * 0.55 - box.top) / box.height) * 100,
      };
    };

    const setCursor = (x: number, y: number) => {
      root.style.setProperty("--cursor-x", String(x));
      root.style.setProperty("--cursor-y", String(y));
    };

    const moveTo = async (which: Side, ms: number) => {
      const to = targetPoint(which);
      root.style.setProperty("--move-ms", `${ms}ms`);
      root.style.setProperty("--move-ease", timing.ease);
      setCursor(to.x, to.y);
      await wait(ms);
    };

    const openSide = (which: Side) => {
      setSide(which);
      setSwapKey((n) => n + 1);
    };

    const loop = async () => {
      setCursor(40, 28);
      while (!cancelled) {
        setBeat("poster");
        setSide("friday");
        setHover(null);
        setPress(null);
        setPressing(false);
        setCursorOn(false);
        await wait(timing.restMs);
        if (cancelled) return;
        setCursorOn(true);
        setBeat("move-unsure");
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
      }
    };

    void loop();
    return () => {
      cancelled = true;
      waits.forEach(clearTimeout);
    };
  }, [playing, timing]);

  return (
    <div
      ref={rootRef}
      className="dlg-thumb"
      data-variant={variant}
      data-beat={beat}
      data-side={side}
      style={{ ["--thumb-scale" as string]: String(scale), ["--cursor-press" as string]: pressing ? "0.92" : "1" }}
    >
      {showPreview ? <span className="dlg-thumb__preview">Preview</span> : null}
      <div className="dlg-thumb__stage">
        <div className="dlg-thumb__scale">
          <div className={`dialogue-product-root dlg-thumb__panel dp-chat-panel-typography ${dialogueProductFontClassName}`}>
            <ChartVizCard title={FINDING}>
              <div className="dlg-thumb__bar" data-hover={hover || undefined} data-press={press || undefined} data-side={side}>
                <ChartStackedBar
                  lanes
                  total={300}
                  segments={[
                    { label: "Read it as this Friday", value: 225, display: "225 of 300", focal: true },
                    { label: "Unsure", value: 75, display: "75 of 300" },
                  ]}
                />
              </div>
              <div key={swapKey} className="dlg-thumb__swap">
                <ThumbPeople side={side} />
              </div>
            </ChartVizCard>
          </div>
        </div>
      </div>
      <div className="dlg-thumb__cursor" data-on={cursorOn ? "" : undefined} aria-hidden>
        <CursorArrow />
      </div>
    </div>
  );
}
