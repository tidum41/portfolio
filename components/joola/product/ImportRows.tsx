import type { ReactNode } from "react";
import type { ImportRow, Resolution } from "./data";

/**
 * The import preview grid from the v18 prototype (CsvImportDialog, `csv-grid`), ported with
 * its markup, columns and copy. Three deliberate deviations, all so the grid never moves:
 *  - the product name stays on one line and truncates (the prototype wraps a flagged name),
 *  - the flagged row keeps its 72px height after it is resolved, with every cell stretched,
 *    so only the quantity text and the status cell's contents change,
 *  - the status column is 204px wide (190px in the prototype) so "Keep 360" stays on one line.
 */

/** The look of the Change button: at rest, with the pointer over it, or pressed. Loops set it; people use the real states. */
export type ButtonLook = "rest" | "hover" | "press";

type Props = {
  rows: readonly ImportRow[];
  /** What happened on the flagged row. Defaults to still asking. */
  resolution?: Resolution;
  /** Forces the Change button's look for loops. */
  look?: ButtonLook;
  onResolve?: (choice: Exclude<Resolution, "open">) => void;
  /** Keyboard users can press the real buttons; loops pass false. */
  interactive?: boolean;
  /** Case-study annotations: row number to marker number, drawn in the Row cell. Not product UI. */
  marks?: Readonly<Record<number, number>>;
  label: string;
};

const LOOK_CLASS: Record<ButtonLook, string> = { rest: "", hover: " is-hover", press: " is-pressed" };

function StatusPill({ tone, children }: { tone: "green" | "danger"; children: ReactNode }) {
  return <span className={`jp-pill jp-pill--${tone}`}>{children}</span>;
}

export default function ImportRows({ rows, resolution = "open", look = "rest", onResolve, interactive = false, marks, label }: Props) {
  return (
    <div className="jp-csv" role="table" aria-label={label}>
      <div className="jp-csv__head" role="row">
        <div role="columnheader">Row</div>
        <div role="columnheader" className="jp-csv__sku">SKU</div>
        <div role="columnheader">Product</div>
        <div role="columnheader" className="jp-csv__end">Qty</div>
        <div role="columnheader" className="jp-csv__statushead">Status</div>
      </div>
      <div className="jp-csv__body" role="rowgroup">
        {rows.map((r) => {
          const decision = r.status === "flagged";
          const open = r.status === "flagged" && resolution === "open";
          const qty = r.status === "flagged" && resolution === "changed" ? r.usual : r.qty;
          return (
            <div
              key={r.row}
              role="row"
              className={`jp-csv__row${r.status === "unknown" ? " is-skipped" : ""}${decision ? " is-decision" : ""}`}
            >
              <div role="cell" className={marks?.[r.row] ? "jp-csv__rowcell" : undefined}>
                <span className="jp-csv__t jp-tnum">{r.row}</span>
                {marks?.[r.row] ? <span className="jo-marker jp-csv__mark" aria-hidden="true">{marks[r.row]}</span> : null}
              </div>
              <div role="cell" className="jp-csv__sku"><span className="jp-csv__t jp-tnum">{r.sku}</span></div>
              <div role="cell" title={r.name}><span className="jp-csv__t">{r.name}</span></div>
              <div role="cell" className="jp-csv__end"><span className="jp-tnum">{qty}</span></div>
              <div role="cell" className="jp-csv__status">
                {r.status === "flagged" && open ? (
                  <span className="jp-csv__flag">
                    <span className="jp-csv__why">Usually {r.usual}, check quantity</span>
                    <span className="jp-csv__acts">
                      <button
                        type="button"
                        className={`jp-btn jp-btn--outline jp-btn--sm${LOOK_CLASS[look]}`}
                        tabIndex={interactive ? 0 : -1}
                        onClick={() => onResolve?.("changed")}
                      >
                        Change to {r.usual}
                      </button>
                      <button
                        type="button"
                        className="jp-csv__keep"
                        tabIndex={interactive ? 0 : -1}
                        onClick={() => onResolve?.("kept")}
                      >
                        Keep {r.qty}
                      </button>
                    </span>
                  </span>
                ) : r.status === "unknown" ? (
                  <StatusPill tone="danger">SKU not found (skipped)</StatusPill>
                ) : (
                  <StatusPill tone="green">Ready</StatusPill>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
