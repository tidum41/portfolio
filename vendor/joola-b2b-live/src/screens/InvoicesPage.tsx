import { useState } from "react";
import { money, moneyWhole } from "../data/ledger";
import { useStore } from "../state/Store";
import { useScreenQuery } from "../hooks/useScreenQuery";
import {
  Button,
  Drawer,
  EmptyState,
  ErrorState,
  Skeleton,
  StatusPill,
  SyncBanner,
  formatShortDate,
} from "../components/ui/primitives";
import type { Invoice } from "../data/ledger";

function toneFor(status: Invoice["status"]) {
  if (status === "Paid") return "green" as const;
  if (status === "Overdue") return "danger" as const;
  if (status === "Processing") return "amber" as const;
  return "neutral" as const;
}

export function InvoicesPage() {
  const { invoices, account } = useStore();
  const [drawer, setDrawer] = useState<Invoice | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const { status, error, reload, syncing } = useScreenQuery(
    "invoices",
    () => invoices,
    [invoices.length],
  );

  const remaining = account?.creditRemaining ?? 0;
  const limit = account?.creditLimit ?? 25000;

  if (status === "loading") {
    return (
      <section className="page page--invoices">
        <h1>Invoices and terms</h1>
        <Skeleton rows={4} />
      </section>
    );
  }

  if (status === "error" && error) {
    return (
      <section className="page page--invoices">
        <h1>Invoices and terms</h1>
        <ErrorState
          title="Invoices did not load."
          message={error.message}
          fix={error.fix}
          onRetry={reload}
        />
      </section>
    );
  }

  if (status === "empty") {
    return (
      <section className="page page--invoices">
        <h1>Invoices and terms</h1>
        <EmptyState>No invoices yet for this account.</EmptyState>
      </section>
    );
  }

  return (
    <section className="page page--invoices">
      <div className="page-head-row">
        <div>
          <h1>Invoices and terms</h1>
          <p className="page-lede">
            Net 30 credit {money(remaining)} left of {moneyWhole(limit)}.
          </p>
        </div>
        <Button variant="outline" onClick={() => setTermsOpen(true)}>
          View Net 30 terms
        </Button>
      </div>
      {syncing ? <SyncBanner /> : null}

      <div className="invoice-table">
        <div className="invoice-table__head">
          <span>Invoice</span>
          <span>Order</span>
          <span>Issued</span>
          <span>Due</span>
          <span className="end">Amount</span>
          <span>Status</span>
          <span />
        </div>
        {invoices.map((inv) => (
          <div className="invoice-table__row" key={inv.id}>
            <span className="tnum">{inv.id}</span>
            <span>{inv.order}</span>
            <span>{formatShortDate(inv.issued)}</span>
            <span>{formatShortDate(inv.due)}</span>
            <span className="end tnum">{money(inv.amount)}</span>
            <StatusPill tone={toneFor(inv.status)}>{inv.status}</StatusPill>
            <Button variant="ghost" onClick={() => setDrawer(inv)}>
              {inv.status === "Paid" ? "View receipt" : "View invoice"}
            </Button>
          </div>
        ))}
      </div>

      <Drawer
        open={Boolean(drawer)}
        onClose={() => setDrawer(null)}
        title={drawer?.status === "Paid" ? "Receipt" : "Invoice"}
      >
        {drawer ? (
          <div className="invoice-drawer">
            <div className="row">
              <span>Document</span>
              <strong>{drawer.id}</strong>
            </div>
            <div className="row">
              <span>Order</span>
              <strong>{drawer.order}</strong>
            </div>
            <div className="row">
              <span>Issued</span>
              <strong>{formatShortDate(drawer.issued)}</strong>
            </div>
            <div className="row">
              <span>Due</span>
              <strong>{formatShortDate(drawer.due)}</strong>
            </div>
            <div className="row">
              <span>Amount</span>
              <strong className="tnum">{money(drawer.amount)}</strong>
            </div>
            <div className="row">
              <span>Status</span>
              <StatusPill tone={toneFor(drawer.status)}>{drawer.status}</StatusPill>
            </div>
            {drawer.receiptId ? (
              <div className="row">
                <span>Receipt</span>
                <strong>{drawer.receiptId}</strong>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>

      <Drawer
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="Net 30 terms"
      >
        <div className="terms-copy">
          <p>
            Invoices are due 30 days from the issue date. Open balances reduce
            available credit until paid.
          </p>
          <p>
            Orders over remaining credit stay on pending approval until a JOOLA rep approves them.
          </p>
          <p>
            Credit limit for {account?.name ?? "this account"} is{" "}
            {moneyWhole(limit)}. Available now: {money(remaining)}.
          </p>
        </div>
      </Drawer>
    </section>
  );
}

export default InvoicesPage;
