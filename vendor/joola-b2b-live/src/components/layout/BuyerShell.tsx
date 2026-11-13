import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ACCOUNTS, DISCLAIMER, money } from "../../data/ledger";
import { useStore } from "../../state/Store";
import { Avatar, Button, Modal } from "../ui/primitives";
import { publicAsset } from "../../lib/publicAsset";
import { NavIcon, type NavIconName } from "./NavIcon";
/* Account list comes from ledger; session actions from store. */

const NAV: { to: string; label: string; icon: NavIconName }[] = [
  { to: "/quick-order", label: "Quick order", icon: "list-plus" },
  { to: "/catalog", label: "Catalog", icon: "catalog" },
  { to: "/saved-orders", label: "Saved orders", icon: "templates" },
  { to: "/orders", label: "Order history", icon: "clock" },
  { to: "/invoices", label: "Invoices", icon: "invoices" },
  { to: "/messages", label: "Messages", icon: "messages" },
];

export function BuyerShell({
  children,
  protoFoot,
}: {
  children?: ReactNode;
  protoFoot?: boolean;
}) {
  const { cart, cartTotal } = useStore();
  const units = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="app shell buyer-shell">
      <aside className="shell__sidebar">
        <img className="shell__logo" src={publicAsset("joola-logo.png")} alt="JOOLA" />
        <span className="shell__chip">Wholesale</span>
        <nav className="shell__nav" aria-label="Buyer portal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <a
          className="shell__back"
          href="https://www.joola.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Back to joola.com</span>
          <NavIcon name="external" />
        </a>
      </aside>
      <div className="shell__main">
        <header className="shell__topbar">
          <Link
            to="/cart"
            className="cart-pill"
            aria-label={
              units > 0
                ? `Cart, ${money(cartTotal)}, ${units} units`
                : `Cart, ${money(cartTotal)}`
            }
          >
            <NavIcon name="cart" />
            <span className="cart-pill__total tnum">{money(cartTotal)}</span>
            {units > 0 ? (
              <span
                className={`cart-pill__count${
                  units >= 10 ? " is-wide" : ""
                }`}
              >
                <span className="count-fig">{units.toLocaleString("en-US")}</span>
              </span>
            ) : null}
          </Link>
          <AccountMenu />
        </header>
        <main className="shell__body">
          {children ?? <Outlet />}
          {protoFoot ? null : (
            <p className="disclaimer-strip">{DISCLAIMER}</p>
          )}
        </main>
        {protoFoot ? (
          <footer className="shell__site-foot">
            <p className="disclaimer-strip">{DISCLAIMER}</p>
            <div className="proto-picker-safe" aria-hidden="true" />
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function AccountMenu() {
  const { session, account, logout, switchAccount } = useStore();
  const [open, setOpen] = useState(false);
  const [chooser, setChooser] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!session || !account) return null;

  return (
    <>
      <div className="account-menu" ref={rootRef}>
        <button
          type="button"
          className="account-menu__trigger"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Avatar name={account.buyer} />
          <span className="account-menu__meta">
            <span className="name">{account.name}</span>
            <span className="role">
              {account.buyer}, {account.role}
            </span>
          </span>
        </button>
        {open ? (
          <div className="account-menu__panel" role="menu">
            <div className="account-menu__signed">
              <div className="label">Signed in</div>
              <div className="who">{session.email}</div>
              <div className="acct">{account.name}</div>
            </div>
            <button type="button" role="menuitem" onClick={() => setOpen(false)}>
              Settings
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setChooser(true);
              }}
            >
              Switch account
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        open={chooser}
        onClose={() => setChooser(false)}
        title="Switch account"
      >
        <p className="modal__ctx">
          Choose which distributor account to order under.
        </p>
        <div className="account-chooser" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {ACCOUNTS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="btn btn--outline"
              style={{ justifyContent: "flex-start", height: "auto", padding: "12px 14px" }}
              onClick={() => {
                switchAccount(a.id);
                setChooser(false);
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <strong style={{ fontWeight: 500 }}>{a.name}</strong>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>
                  {a.buyer}, {a.role}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="modal__actions">
          <Button variant="ghost" onClick={() => setChooser(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default BuyerShell;
