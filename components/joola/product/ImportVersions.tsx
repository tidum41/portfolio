"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import ImportRows from "./ImportRows";
import { ROW_18, ROW_18_UNCHECKED, ROW_22, type Resolution } from "./data";

/**
 * Three versions of Maya's import in one figure, as tabs (WAI-ARIA tabs pattern:
 * arrow keys, Home and End move between tabs, and focus follows selection).
 * Every tab shows the same two rows so the reader compares like with like.
 */

export type ImportVersion = {
  id: "v1" | "v2" | "final";
  tab: string;
  caption: string;
  /** Numbered notes for the markers drawn on the rows (Final only). */
  notes?: readonly string[];
};

type Props = {
  versions: readonly ImportVersion[];
  label: string;
  /** Shown under the earlier tabs only, since the Final tab is the real design. */
  earlierNote?: string;
};

/**
 * V1: the cart after the first import, with the prototype's error notice and its cart table
 * header. Simplified (no thumbnail or stepper), so it is the one tab that is not the real component.
 */
function AlertVersion() {
  return (
    <div className="jp-cartv1" role="group" aria-label="Cart after the first import">
      <p className="jp-notice jp-notice--error" role="presentation">Row 22 could not be imported.</p>
      <div className="jp-cartv1__head" role="presentation">
        <span>Product</span>
        <span className="jp-cartv1__end">Qty</span>
        <span className="jp-cartv1__end">Total</span>
      </div>
      <div className="jp-cartv1__line" role="presentation">
        <span className="jp-cartv1__name" title={ROW_18.name}>{ROW_18.name}</span>
        <span className="jp-cartv1__end jp-tnum">{ROW_18.qty}</span>
        <span className="jp-cartv1__end jp-tnum">$62,629.20</span>
      </div>
    </div>
  );
}

function FinalVersion({ resolution, onResolve, marked }: { resolution: Resolution; onResolve: (choice: Exclude<Resolution, "open">) => void; marked: boolean }) {
  return (
    <ImportRows
      rows={[ROW_18, ROW_22]}
      resolution={resolution}
      interactive
      onResolve={onResolve}
      marks={marked ? { [ROW_18.row]: 1, [ROW_22.row]: 2 } : undefined}
      label="Final import preview for rows 18 and 22"
    />
  );
}

export default function ImportVersions({ versions, label, earlierNote }: Props) {
  const base = useId();
  const [active, setActive] = useState(versions.length - 1);
  const [resolution, setResolution] = useState<Resolution>("open");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = versions.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  const v = versions[active];
  return (
    <figure className="cs-figure jp-versions">
      <div className="jp-tabs" role="tablist" aria-label={label}>
        {versions.map((t, i) => (
          <button
            key={t.id}
            ref={(n) => { tabs.current[i] = n; }}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            className="jp-tabs__tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t.tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel-${v.id}`}
        aria-labelledby={`${base}-tab-${v.id}`}
        tabIndex={0}
        className="jp-well jp-well--tabs"
      >
        {/* Every version sits in the same grid cell, so the well is always as tall as the tallest one and
            switching tabs never moves the page. Only the selected one is visible and reachable. */}
        <div className="jp jp-scale jp-scale--tabs jp-stack">
          {versions.map((t, i) => {
            const on = i === active;
            return (
              <div key={t.id} className="jp-card" aria-hidden={on ? undefined : true} inert={!on}>
                {t.id === "v1" ? (
                  <AlertVersion />
                ) : t.id === "v2" ? (
                  <ImportRows rows={[ROW_18_UNCHECKED, ROW_22]} label="Import preview for rows 18 and 22" />
                ) : (
                  <FinalVersion resolution={resolution} onResolve={setResolution} marked={Boolean(t.notes?.length)} />
                )}
              </div>
            );
          })}
        </div>
        {/* Page chrome, not product UI. Always in the layout, so choosing never moves the well. */}
        <button
          type="button"
          className="jp-well__reset"
          onClick={() => setResolution("open")}
          hidden={v.id !== "final" || resolution === "open"}
        >
          Reset row 18
        </button>
      </div>
      <figcaption className="jp-versions__cap">
        {v.notes?.length ? (
          <ol className="jo-callouts jo-callouts--sm">
            {v.notes.map((t, i) => (
              <li key={t}><span className="jo-marker jo-marker--inline" aria-hidden="true">{i + 1}</span><span>{t}</span></li>
            ))}
          </ol>
        ) : null}
        <span className="cs-figcaption jp-versions__what">{v.caption}</span>
        {earlierNote && v.id !== "final" ? <span className="cs-figcaption jp-versions__what">{earlierNote}</span> : null}
      </figcaption>
    </figure>
  );
}
