"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  JOOLA_CYCLES,
  findDecision,
  findRound,
  type CycleDecision,
} from "@/lib/caseStudies/joolaCycles";
import "./decision-cycle.css";

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points={dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Thumb({ up }: { up: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {up ? (
        <path
          d="M5 7V13M5 7L7.2 3.4A1.6 1.6 0 0 1 8.6 2.5h.2A1.7 1.7 0 0 1 10.5 4.2V6H13a1.5 1.5 0 0 1 1.5 1.7l-.6 4A1.5 1.5 0 0 1 12.4 13H5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 9V3M5 9L7.2 12.6A1.6 1.6 0 0 0 8.6 13.5h.2A1.7 1.7 0 0 0 10.5 11.8V10H13a1.5 1.5 0 0 0 1.5-1.7l-.6-4A1.5 1.5 0 0 0 12.4 3H5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function isEditableTarget(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    t.isContentEditable
  );
}

function DecisionCycleInner({
  lab = false,
}: {
  lab?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const versionsRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const touchStartX = useRef<number | null>(null);

  const decision = findDecision(searchParams.get("decision"));
  const round = findRound(decision, Number(searchParams.get("v")));
  const roundIndex = decision.rounds.findIndex((r) => r.v === round.v);

  const [replayKey, setReplayKey] = useState(0);
  const [highlightReady, setHighlightReady] = useState(false);

  const writeUrl = useCallback(
    (nextDecision: CycleDecision, v: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("decision", nextDecision.slug);
      params.set("v", String(v));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectDecision = useCallback(
    (slug: string) => {
      const next = findDecision(slug);
      writeUrl(next, next.rounds[0].v);
    },
    [writeUrl],
  );

  const selectVersion = useCallback(
    (v: number) => {
      writeUrl(decision, v);
    },
    [decision, writeUrl],
  );

  const step = useCallback(
    (dir: -1 | 1) => {
      const next = decision.rounds[roundIndex + dir];
      if (!next) return;
      writeUrl(decision, next.v);
    },
    [decision, roundIndex, writeUrl],
  );

  const replay = useCallback(() => {
    setReplayKey((n) => n + 1);
  }, []);

  // Sliding highlight
  useLayoutEffect(() => {
    const root = versionsRef.current;
    const hi = highlightRef.current;
    if (!root || !hi) return;
    const active = root.querySelector<HTMLElement>('[aria-current="true"]');
    if (!active) return;
    const left = active.offsetLeft;
    hi.style.transform = `translateX(${left}px)`;
  }, [decision.slug, round.v]);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHighlightReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Keyboard — only while focus is inside the playground
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onKey = (e: KeyboardEvent) => {
      if (!root.contains(document.activeElement)) return;
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "r" || e.key === "R") {
        if (!decision.motion) return;
        e.preventDefault();
        replay();
      } else if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const next = decision.rounds[idx];
        if (next) {
          e.preventDefault();
          selectVersion(next.v);
        }
      }
    };

    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [decision, replay, selectVersion, step]);

  const Stage = decision.Stage;
  const atStart = roundIndex <= 0;
  const atEnd = roundIndex >= decision.rounds.length - 1;

  const stageKey = useMemo(
    () => `${decision.slug}:${round.v}:${replayKey}`,
    [decision.slug, round.v, replayKey],
  );

  return (
    <div
      ref={rootRef}
      className={`decision-cycle${lab ? " decision-cycle--lab" : ""}`}
      tabIndex={0}
      aria-label="Design cycle playground"
      id="iterations-playground"
    >
      <div className="dc-tabs" role="tablist" aria-label="Design decisions">
        {JOOLA_CYCLES.map((d) => (
          <button
            key={d.slug}
            type="button"
            role="tab"
            className="dc-tab"
            aria-selected={d.slug === decision.slug}
            onClick={() => selectDecision(d.slug)}
          >
            {d.title}
          </button>
        ))}
      </div>

      <div className="dc-picker-row">
        <div className="dc-versions" ref={versionsRef} role="tablist" aria-label="Versions">
          <span
            ref={highlightRef}
            className="dc-highlight"
            data-ready={highlightReady ? "true" : "false"}
            aria-hidden
          />
          {decision.rounds.map((r) => (
            <button
              key={r.v}
              type="button"
              role="tab"
              className="dc-version"
              aria-label={`Version ${r.v}`}
              aria-current={r.v === round.v ? "true" : undefined}
              data-active={r.v === round.v ? "true" : undefined}
              onClick={() => selectVersion(r.v)}
            >
              {r.v}
            </button>
          ))}
        </div>
        {decision.motion ? (
          <>
            <span className="dc-divider" aria-hidden />
            <button
              type="button"
              className="dc-replay"
              aria-label="Replay"
              onClick={replay}
            >
              ↻
            </button>
          </>
        ) : null}
      </div>

      <div
        className="dc-stage"
        onTouchStart={(e) => {
          if (isEditableTarget(e.target)) {
            touchStartX.current = null;
            return;
          }
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const x = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const delta = x - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 40) return;
          step(delta < 0 ? 1 : -1);
        }}
      >
        <Stage key={stageKey} v={round.v} replayKey={replayKey} />
      </div>

      <div className="dc-dots-row">
        <button
          type="button"
          className="dc-arrow"
          aria-label="Previous version"
          disabled={atStart}
          onClick={() => step(-1)}
        >
          <Chevron dir="prev" />
        </button>
        <div className="dc-dots" aria-hidden>
          {decision.rounds.map((r) => (
            <span
              key={r.v}
              className="dc-dot"
              data-active={r.v === round.v ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="dc-arrow"
          aria-label="Next version"
          disabled={atEnd}
          onClick={() => step(1)}
        >
          <Chevron dir="next" />
        </button>
      </div>

      <div className="dc-round" aria-live="polite">
        <p className="dc-round__ver">Version {round.v}</p>
        <p className="dc-round__changed">{round.changed}</p>
        <div className="dc-round__note">
          <Thumb up={round.verdict === "kept"} />
          <span>{round.note}</span>
        </div>
      </div>
    </div>
  );
}

function DecisionCycleFallback() {
  const decision = JOOLA_CYCLES[0];
  const round = decision.rounds[0];
  const Stage = decision.Stage;
  return (
    <div className="decision-cycle" aria-label="Design cycle playground">
      <div className="dc-stage">
        <Stage v={round.v} />
      </div>
    </div>
  );
}

export default function DecisionCycle({ lab = false }: { lab?: boolean }) {
  return (
    <Suspense fallback={<DecisionCycleFallback />}>
      <DecisionCycleInner lab={lab} />
    </Suspense>
  );
}
