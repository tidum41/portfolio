/**
 * Emil Kowalski prototype picker — markup/behavior from PICKER.md, verbatim.
 * Chrome only; never restyle with project tokens.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import "./proto-picker.css";

export type ProtoVariant = {
  name: string;
  render: () => ReactNode;
};

export function ProtoPicker({
  variants,
  hasMotion = false,
  position,
}: {
  variants: ProtoVariant[];
  /** When true, show replay divider + button. */
  hasMotion?: boolean;
  /** Set "top" when a variant occupies bottom-center. */
  position?: "top";
}) {
  const [params, setParams] = useSearchParams();
  const initial =
    Math.min(
      Math.max((parseInt(params.get("v") || "1", 10) || 1) - 1, 0),
      Math.max(variants.length - 1, 0),
    ) || 0;
  const [index, setIndex] = useState(initial);
  const [mountKey, setMountKey] = useState(0);
  const [ready, setReady] = useState(false);
  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveHighlight = useCallback(() => {
    const el = itemRefs.current[index];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [index]);

  const setActive = useCallback(
    (i: number) => {
      if (i < 0 || i >= variants.length) return;
      setIndex(i);
      setMountKey((k) => k + 1);
      const next = new URLSearchParams(params);
      next.set("v", String(i + 1));
      setParams(next, { replace: true });
    },
    [variants.length, params, setParams],
  );

  const remount = useCallback(() => {
    setMountKey((k) => k + 1);
  }, []);

  useLayoutEffect(() => {
    moveHighlight();
  }, [moveHighlight, variants, hasMotion]);

  useEffect(() => {
    const onResize = () => moveHighlight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveHighlight]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= variants.length) setActive(num - 1);
      else if (e.key === "ArrowRight")
        setActive((index + 1) % variants.length);
      else if (e.key === "ArrowLeft")
        setActive((index - 1 + variants.length) % variants.length);
      else if ((e.key === "r" || e.key === "R") && hasMotion) remount();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [variants.length, index, setActive, remount, hasMotion]);

  const active = variants[index];

  return (
    <>
      <div className="proto-stage" key={`${index}-${mountKey}`}>
        {active ? active.render() : null}
      </div>
      <nav
        ref={pickerRef}
        className="proto-picker"
        aria-label="Prototype variants"
        data-position={position}
        data-ready={ready ? "" : undefined}
      >
        <span
          ref={highlightRef}
          className="proto-picker-highlight"
          aria-hidden="true"
        />
        {variants.map((v, i) => (
          <button
            key={v.name}
            type="button"
            className="proto-picker-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-active={i === index ? "" : undefined}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            {v.name}
          </button>
        ))}
        {hasMotion ? (
          <>
            <span className="proto-picker-divider" aria-hidden="true" />
            <button
              type="button"
              className="proto-picker-item proto-picker-replay"
              aria-label="Replay animation (R)"
              onClick={remount}
            >
              ↻
            </button>
          </>
        ) : null}
      </nav>
    </>
  );
}
