import { useMemo } from "react";
import { money, linesUnits } from "../../data/ledger";
import { useStore } from "../../state/Store";
import { useScreenQuery } from "../../hooks/useScreenQuery";
import {
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
  SyncBanner,
} from "../../components/ui/primitives";

export function AdminOrdersPage() {
  const { adminOrders, products } = useStore();
  const { status, error, reload, syncing } = useScreenQuery(
    "admin-orders",
    () => adminOrders,
    [adminOrders.length],
  );

  const sorted = useMemo(
    () => [...adminOrders],
    [adminOrders],
  );

  if (status === "loading") {
    return (
      <section className="page page--admin-orders">
        <h1>Recent orders</h1>
        <Skeleton rows={5} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--admin-orders">
        <h1>Recent orders</h1>
        <ErrorState
          title="Orders did not load"
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  return (
    <section className="page page--admin-orders">
      <h1>Recent orders</h1>
      <p className="page-lede">
        Orders placed within credit limit and auto-approved. Open the approval
        queue only when an account goes over.
      </p>
      {syncing ? <SyncBanner>Refreshing orders…</SyncBanner> : null}

      {status === "empty" || sorted.length === 0 ? (
        <EmptyState>No recent orders yet.</EmptyState>
      ) : (
        <div className="rep-table-wrap">
          <table className="rep-table admin-orders-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Order</th>
                <th>Placed</th>
                <th>Lines</th>
                <th>Status</th>
                <th className="end">Total</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id}>
                  <td className="rep-dist">
                    <strong>{row.distributor}</strong>
                    <div className="sub">{row.buyer}</div>
                  </td>
                  <td className="tnum">{row.so}</td>
                  <td>{row.placed}</td>
                  <td className="tnum">
                    {row.lines.length} · {linesUnits(row.lines)} units
                    <div className="sub">
                      {row.lines
                        .slice(0, 2)
                        .map((l) => products[l.productId]?.name ?? l.productId)
                        .join(", ")}
                      {row.lines.length > 2
                        ? ` +${row.lines.length - 2} more`
                        : ""}
                    </div>
                  </td>
                  <td>
                    <StatusPill
                      tone={
                        row.status === "Auto-approved" ? "green" : "neutral"
                      }
                    >
                      {row.status}
                    </StatusPill>
                  </td>
                  <td className="end tnum">{money(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminOrdersPage;
