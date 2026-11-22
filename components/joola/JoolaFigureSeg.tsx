"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

export type SegOption<T extends string> = { value: T; label: string };

/**
 * Apple-style segmented control for figure comparisons.
 */
export default function JoolaFigureSeg<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SegOption<T>[];
  onChange: (value: T) => void;
}) {
  const groupId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const index = options.findIndex((o) => o.value === value);

  useLayoutEffect(() => {
    const btn = refs.current[index];
    const track = trackRef.current;
    if (!btn || !track) return;
    const t = track.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    setIndicator({ left: b.left - t.left, width: b.width });
  }, [index, options, value]);

  function onKeyDown(e: KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (i + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (i - 1 + options.length) % options.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = options.length - 1;
    } else {
      return;
    }
    const opt = options[next];
    onChange(opt.value);
    refs.current[next]?.focus();
  }

  return (
    <div
      className="joola-figure-seg"
      role="tablist"
      aria-label={label}
      id={groupId}
      ref={trackRef}
    >
      <span
        className="joola-figure-seg__indicator"
        aria-hidden
        style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
      />
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`joola-figure-seg__btn${selected ? " is-on" : ""}`}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
