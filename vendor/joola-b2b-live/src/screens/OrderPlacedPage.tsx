import { Link } from "react-router-dom";
import { JOOLA_STAFF } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
} from "../components/ui/primitives";

export function OrderPlacedPage() {
  const { lastPlacedOrderId, lastPlacedOrderStatus } = useStore();
  const { status, error, reload } = useScreenQuery(
    "order-placed",
    () => lastPlacedOrderId,
    [lastPlacedOrderId],
  );

  const displayStatus = lastPlacedOrderStatus ?? "Pending confirmation";
  const pendingApproval = displayStatus === "Pending approval";
  const repName = JOOLA_STAFF.collin.name;

  if (status === "loading") {
    return (
      <section className="page page--placed">
        <Skeleton rows={3} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--placed">
        <ErrorState
          title="Confirmation did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (!lastPlacedOrderId || status === "empty") {
    return (
      <section className="page page--placed">
        <EmptyState>
          No recent order to show. Place an order from Review to see confirmation.
        </EmptyState>
        <div style={{ marginTop: 16 }}>
          <Link to="/quick-order" className="btn btn--primary">
            Back to Quick order
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page--placed">
      <StatusPill tone={pendingApproval ? "amber" : "green"}>
        {displayStatus}
      </StatusPill>
      <h1>{displayStatus}</h1>
      <p className="page-lede">
        {pendingApproval
          ? `${repName} needs to approve this order before a ship date can be confirmed.`
          : `${repName} will confirm your ship date.`}
      </p>
      <div className="placed-actions">
        <Link to="/quick-order" className="btn btn--primary">
          Back to Quick order
        </Link>
        <Link to="/messages" className="btn btn--outline">
          Message {repName.split(" ")[0]}
        </Link>
        <Link to="/orders" className="btn btn--ghost">
          View order history
        </Link>
      </div>
    </section>
  );
}

export default OrderPlacedPage;
