/**
 * Round 5b states sheet — real components × interactive states.
 * Route: /dev/states-sheet (outside buyer shell; wraps .app itself).
 */
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import {
  Button,
  Input,
  QtyStepper,
  StatusPill,
  SearchField,
} from "../../components/ui/primitives";
import { NavIcon } from "../../components/layout/NavIcon";

const COLS = [
  "default",
  "hover",
  "focus-visible",
  "active",
  "selected",
  "disabled",
  "loading",
  "error",
] as const;

type Col = (typeof COLS)[number];

function cellClass(col: Col) {
  if (col === "hover") return "is-demo-hover";
  if (col === "focus-visible") return "is-demo-focus";
  if (col === "active") return "is-demo-active";
  if (col === "selected") return "is-demo-selected";
  if (col === "error") return "is-error";
  return undefined;
}

function NA() {
  return <span className="states-na">N/A</span>;
}

function StaticToast({
  type,
  title,
  action,
}: {
  type: "success" | "error" | "message";
  title: string;
  action?: string;
}) {
  return (
    <div className="states-toast" data-type={type} role="status">
      <span className="states-toast__title">{title}</span>
      {action ? (
        <button type="button" className="states-toast__action">
          {action}
        </button>
      ) : null}
    </div>
  );
}

function Row({
  label,
  render,
}: {
  label: string;
  render: (col: Col) => ReactNode;
}) {
  return (
    <div className="states-sheet__row">
      <div className="states-sheet__row-label">{label}</div>
      <div className="states-sheet__cols">
        {COLS.map((col) => (
          <div key={col} className="states-sheet__cell" data-state={col}>
            <div className="states-sheet__col-label">{col}</div>
            <div className="states-sheet__sample">{render(col)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatesSheet() {
  const [qty, setQty] = useState(12);

  return (
    <div className="app states-sheet-root">
      <Toaster position="top-right" />
      <div className="page states-sheet">
        <h1>States sheet</h1>
        <p className="page-lede">
          Real components across default / hover / focus-visible / active /
          selected / disabled / loading / error. Demo classes simulate hover,
          focus, and active for still screenshots.
        </p>

        <div className="states-sheet__legend" aria-hidden>
          {COLS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        <Row
          label="Button · primary"
          render={(col) =>
            col === "selected" || col === "error" ? (
              <NA />
            ) : (
              <Button
                variant="primary"
                disabled={col === "disabled"}
                loading={col === "loading"}
                className={cellClass(col)}
              >
                Add to cart
              </Button>
            )
          }
        />
        <Row
          label="Button · secondary (outline)"
          render={(col) =>
            col === "selected" || col === "error" ? (
              <NA />
            ) : (
              <Button
                variant="outline"
                disabled={col === "disabled"}
                loading={col === "loading"}
                className={cellClass(col)}
              >
                Approve
              </Button>
            )
          }
        />
        <Row
          label="Button · danger"
          render={(col) =>
            col === "selected" || col === "error" ? (
              <NA />
            ) : (
              <Button
                variant="danger"
                disabled={col === "disabled"}
                loading={col === "loading"}
                className={cellClass(col)}
              >
                Reject order
              </Button>
            )
          }
        />
        <Row
          label="Button · ghost"
          render={(col) =>
            col === "selected" || col === "error" || col === "loading" ? (
              <NA />
            ) : (
              <Button
                variant="ghost"
                disabled={col === "disabled"}
                className={cellClass(col)}
              >
                Cancel
              </Button>
            )
          }
        />
        <Row
          label="Input"
          render={(col) =>
            col === "hover" ||
            col === "active" ||
            col === "selected" ||
            col === "loading" ? (
              <NA />
            ) : (
              <Input
                defaultValue={col === "error" ? "" : "SO-48288"}
                placeholder="Required"
                disabled={col === "disabled"}
                aria-invalid={col === "error"}
                className={cellClass(col)}
              />
            )
          }
        />
        <Row
          label="Search"
          render={(col) =>
            col === "hover" ||
            col === "active" ||
            col === "selected" ||
            col === "loading" ? (
              <NA />
            ) : (
              <SearchField
                disabled={col === "disabled"}
                className={cellClass(col)}
                defaultValue={col === "default" ? "" : "Perseus"}
              />
            )
          }
        />
        <Row
          label="Qty stepper"
          render={(col) =>
            col === "loading" ? (
              <NA />
            ) : (
              <QtyStepper
                value={col === "selected" ? 12 : col === "error" ? 2 : qty}
                onChange={setQty}
                moq={6}
                presets={[6, 12, 24]}
                disabled={col === "disabled"}
                error={col === "error"}
              />
            )
          }
        />
        <Row
          label="Chip / status"
          render={(col) => (col === "default" ? <StatusPill tone="amber">Over limit</StatusPill> : <NA />)}
        />
        <Row
          label="Table row"
          render={(col) =>
            col === "active" ||
            col === "disabled" ||
            col === "loading" ||
            col === "error" ? (
              <NA />
            ) : (
              <table className="rep-table rep-table--decision states-mini-table">
                <tbody>
                  <tr
                    className={
                      col === "selected" || col === "focus-visible"
                        ? "is-selected"
                        : col === "hover"
                          ? "is-demo-row-hover"
                          : undefined
                    }
                  >
                    <td className="rep-dist">
                      <strong className="rep-dist__name">Dick&apos;s Sporting Goods</strong>
                      <div className="sub">SO-48288 · Maya Okonkwo</div>
                    </td>
                    <td className="rep-over">
                      <div className="rep-over__amt is-over-amt tnum">$6,197.52</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            )
          }
        />
        <Row
          label="Nav item"
          render={(col) =>
            col === "disabled" || col === "loading" || col === "error" ? (
              <NA />
            ) : (
              <nav className="shell__nav states-nav" aria-label="Demo nav">
                <a
                  href="#states"
                  className={
                    col === "selected" ? "is-active" : cellClass(col)
                  }
                  onClick={(e) => e.preventDefault()}
                >
                  <NavIcon name="list-plus" />
                  <span>Quick order</span>
                </a>
              </nav>
            )
          }
        />
        <Row
          label="Toast"
          render={(col) => {
            if (col === "default")
              return <StaticToast type="success" title="Order approved" />;
            if (col === "error")
              return <StaticToast type="error" title="Could not save" />;
            if (col === "active")
              return (
                <StaticToast
                  type="message"
                  title="Removed Perseus"
                  action="Undo"
                />
              );
            return <NA />;
          }}
        />
      </div>
    </div>
  );
}

export default StatesSheet;
