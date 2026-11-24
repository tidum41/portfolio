"use client";

/* Depth r4, option 4 (dev only, PENDING Mudit's OK, not importable on /dialogue): the reply's depth picked from a
   model-picker style menu in the composer, the way Cursor or ChatGPT pick a model. Built from what the composer already
   has: the trigger is the depth tab chip's type and fills, the menu is the tooltip chip's surface (stone border,
   --shadow-chat), the selected row carries the product CheckIcon, the trigger the product ChevronDownIcon. No Lucide.
   Keyboard: Enter, Space or an arrow opens it on the checked row; arrows and Home/End move; Enter or Space picks and
   closes; Escape or Tab closes. Focus returns to the trigger. See README-DepthMenu.md. */
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/dialogue/product/icons";

export const DEPTHS = ["Insight", "Chart", "People"] as const;
export type Depth = (typeof DEPTHS)[number];
/** One line under each depth: what the reply adds at that depth (proposal copy, Mudit writes the final). */
export const DEPTH_NOTE: Record<Depth, string> = {
  Insight: "The answer in a sentence",
  Chart: "Adds the count behind it",
  People: "Adds quotes you can play",
};

type Props = {
  value: Depth;
  onChange: (d: Depth) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DepthMenu({ value, onChange, open, onOpenChange }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  // Opening lands focus on the checked row, the way a native select does.
  useEffect(() => {
    if (!open) return;
    const i = DEPTHS.indexOf(value);
    const f = requestAnimationFrame(() => items.current[i]?.focus());
    return () => cancelAnimationFrame(f);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // A press anywhere outside closes it without picking.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onOpenChange(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, onOpenChange]);

  const close = (refocus = true) => {
    onOpenChange(false);
    if (refocus) trigger.current?.focus();
  };
  const pick = (d: Depth) => {
    onChange(d);
    close();
  };
  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); onOpenChange(true); }
  };
  const onListKey = (e: KeyboardEvent) => {
    const at = items.current.findIndex((el) => el === document.activeElement);
    const go = (i: number) => items.current[(i + DEPTHS.length) % DEPTHS.length]?.focus();
    if (e.key === "ArrowDown") { e.preventDefault(); go(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(at - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(DEPTHS.length - 1); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") close(false);
  };

  return (
    <div className="dlgv-menu" ref={root} data-open={open ? "" : undefined}>
      <button
        ref={trigger}
        type="button"
        className="dlgv-menu__trigger"
        data-target="depth-menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Depth for this reply: ${value}`}
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKey}
      >
        <span className="dlgv-menu__value">{value}</span>
        <ChevronDownIcon className="dlgv-menu__chevron" />
      </button>
      <div id={id} className="dlgv-menu__list" role="menu" aria-label="Depth for this reply" onKeyDown={onListKey}>
        <p className="dlgv-menu__head" aria-hidden>Depth for this reply</p>
        {DEPTHS.map((d, i) => (
          <button
            key={d}
            ref={(el) => { items.current[i] = el; }}
            type="button"
            role="menuitemradio"
            aria-checked={d === value}
            tabIndex={open ? 0 : -1}
            className="dlgv-menu__item"
            data-target={`depth-menu-${d.toLowerCase()}`}
            onClick={() => pick(d)}
          >
            <span className="dlgv-menu__name">{d}</span>
            <span className="dlgv-menu__note">{DEPTH_NOTE[d]}</span>
            <span className="dlgv-menu__check" aria-hidden>{d === value ? <CheckIcon /> : null}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
