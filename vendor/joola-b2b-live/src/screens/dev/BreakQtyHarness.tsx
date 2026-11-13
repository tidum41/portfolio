/**
 * Jakub /break harness: QtyStepper under worst-case scenarios.
 * Route: /dev/break-qty — not linked from production nav.
 */
import { useState } from "react";
import { QtyStepper } from "../../components/ui/primitives";

const SCENARIOS: {
  id: string;
  label: string;
  note?: string;
  props: {
    value: number;
    moq: number;
    presets: number[];
    error?: boolean;
    disabled?: boolean;
  };
}[] = [
  {
    id: "untouched",
    label: "Untouched qty 0 (neutral)",
    props: { value: 0, moq: 12, presets: [12, 48, 100] },
  },
  {
    id: "touched-below",
    label: "Touched below MOQ (muted hint)",
    note: "Observed: muted hint only after a real +/- press (prop-fed value stays silent)",
    props: { value: 3, moq: 12, presets: [12, 48, 100] },
  },
  {
    id: "failed-add",
    label: "Failed add below MOQ (red)",
    props: { value: 3, moq: 12, presets: [12, 48, 100], error: true },
  },
  {
    id: "huge-moq",
    label: "Huge MOQ number",
    note: "Presets use locale grouping (1,000,000); no mid-number ellipsis",
    props: { value: 1, moq: 1000000, presets: [1000000, 2000000, 5000000] },
  },
  {
    id: "huge-qty",
    label: "Huge quantity value",
    note: "Survived: 7-digit qty stays inside the stepper",
    props: { value: 9999999, moq: 12, presets: [12, 48, 100] },
  },
  {
    id: "zero-presets",
    label: "No presets",
    props: { value: 12, moq: 1, presets: [] },
  },
  {
    id: "disabled",
    label: "Disabled",
    props: { value: 12, moq: 12, presets: [12, 48, 100], disabled: true },
  },
  {
    id: "narrow",
    label: "Narrow 220px container",
    props: { value: 0, moq: 12, presets: [12, 48, 100] },
  },
];

export function BreakQtyHarness() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(SCENARIOS.map((s) => [s.id, s.props.value])),
  );

  return (
    <div className="page" style={{ maxWidth: 720, padding: 24 }}>
      <h1>Break: QtyStepper</h1>
      <p className="page-lede">
        One scenario per block. Notes under a label are observed breaks.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {SCENARIOS.map((s) => (
          <div key={s.id}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              {s.label}
            </div>
            {s.note ? (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--danger)",
                  marginBottom: 8,
                }}
              >
                {s.note}
              </div>
            ) : null}
            <div
              style={{
                width: s.id === "narrow" ? 220 : 280,
                border: "1px dashed var(--line)",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <QtyStepper
                value={values[s.id] ?? s.props.value}
                moq={s.props.moq}
                presets={s.props.presets}
                error={s.props.error}
                disabled={s.props.disabled}
                onChange={(n) =>
                  setValues((prev) => ({ ...prev, [s.id]: n }))
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BreakQtyHarness;
