/**
 * Jakub /break harness: Approval decision row under worst-case scenarios.
 * Route: /dev/break-approvals — not linked from production nav.
 */
import { StatusPill, Button } from "../../components/ui/primitives";
import { money } from "../../data/ledger";

type RowFixture = {
  distributor: string;
  so: string;
  buyer: string;
  over: number;
  orderTotal: number;
  remaining: number;
  overdue: number;
  selected?: boolean;
};

const SCENARIOS: {
  id: string;
  label: string;
  note?: string;
  width?: number;
  row: RowFixture;
}[] = [
  {
    id: "default",
    label: "Default Dick's over-limit",
    row: {
      distributor: "Dick's Sporting Goods",
      so: "SO-48288",
      buyer: "Maya Okonkwo",
      over: 6197.52,
      orderTotal: 18447.52,
      remaining: 12250,
      overdue: 0,
      selected: true,
    },
  },
  {
    id: "long-name",
    label: "Long account + buyer names",
    note: "Observed: name truncates with ellipsis in Account column",
    row: {
      distributor: "Northwind Industries Holdings Pickleball Wholesale Cooperative",
      so: "SO-99991",
      buyer: "Aleksandra Wiśniewska-Kowalczyk",
      over: 12450.0,
      orderTotal: 28450,
      remaining: 16000,
      overdue: 0,
    },
  },
  {
    id: "huge-over",
    label: "Huge over-by figure",
    row: {
      distributor: "Baseline Athletics",
      so: "SO-70001",
      buyer: "Jordan Hale",
      over: 999999.99,
      orderTotal: 1200000,
      remaining: 200000.01,
      overdue: 0,
    },
  },
  {
    id: "dual-flags",
    label: "Over limit + overdue pills",
    row: {
      distributor: "Courtside Club Shop",
      so: "SO-61012",
      buyer: "Sam Rivera",
      over: 842.1,
      orderTotal: 7125,
      remaining: 6282.9,
      overdue: 2140.55,
    },
  },
  {
    id: "one-letter",
    label: "One-letter buyer",
    row: {
      distributor: "Spin Lab",
      so: "SO-1",
      buyer: "Jo",
      over: 12,
      orderTotal: 112,
      remaining: 100,
      overdue: 0,
    },
  },
  {
    id: "narrow",
    label: "Narrow 640px container",
    width: 640,
    note: "Observed: Actions wrap; Over-by stays tabular",
    row: {
      distributor: "Dick's Sporting Goods",
      so: "SO-48288",
      buyer: "Maya Okonkwo",
      over: 6197.52,
      orderTotal: 18447.52,
      remaining: 12250,
      overdue: 3200,
      selected: true,
    },
  },
];

function DecisionRow({ row }: { row: RowFixture }) {
  return (
    <table className="rep-table rep-table--decision" style={{ minWidth: 0 }}>
      <thead>
        <tr>
          <th>Account</th>
          <th className="end">Over by</th>
          <th>Why</th>
          <th className="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr className={row.selected ? "is-selected" : undefined}>
          <td className="rep-dist">
            <strong className="rep-dist__name">{row.distributor}</strong>
            <div className="sub">
              {row.so} · {row.buyer}
            </div>
          </td>
          <td className="rep-over end">
            <div className="rep-over__amt is-over-amt tnum">{money(row.over)}</div>
            <div className="sub tnum">
              Order {money(row.orderTotal)} · left {money(row.remaining)}
            </div>
          </td>
          <td>
            <div className="rep-why">
              <div className="rep-why__pills">
                {row.over > 0 ? (
                  <StatusPill tone="amber">Over limit</StatusPill>
                ) : null}
                {row.overdue > 0 ? (
                  <StatusPill tone="danger">Overdue {money(row.overdue)}</StatusPill>
                ) : null}
              </div>
            </div>
          </td>
          <td>
            <div className="rep-actions">
              <Button variant={row.selected ? "primary" : "outline"}>Approve</Button>
              <Button variant="reject">Reject</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function BreakApprovalsHarness() {
  return (
    <div className="page" style={{ maxWidth: 960, padding: 24 }}>
      <h1>Break: Approval decision row</h1>
      <p className="page-lede">
        Decision-first hierarchy under worst-case content. Notes under a label
        are observed breaks.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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
                width: s.width ?? "100%",
                maxWidth: "100%",
                overflow: "auto",
                border: "1px dashed var(--line)",
                padding: 8,
              }}
            >
              <DecisionRow row={s.row} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BreakApprovalsHarness;
