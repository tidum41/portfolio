import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { DISCLAIMER, JOOLA_STAFF } from "../../data/ledger";
import { useStore } from "../../state/Store";
import { Avatar, Button } from "../ui/primitives";
import { NavIcon } from "./NavIcon";

export function AdminShell({ children }: { children?: ReactNode }) {
  const { logout } = useStore();
  const rep = JOOLA_STAFF.collin;

  return (
    <div className="app shell admin-shell">
      <aside className="shell__sidebar">
        <img className="shell__logo" src="/joola-logo.png" alt="JOOLA" />
        <span className="shell__chip">Wholesale</span>
        <nav className="shell__nav" aria-label="Admin portal">
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? "is-active" : undefined)}
          >
            <NavIcon name="orders" />
            <span>Orders</span>
          </NavLink>
          <NavLink
            to="/admin/approvals"
            className={({ isActive }) => (isActive ? "is-active" : undefined)}
          >
            <NavIcon name="shield" />
            <span>Approvals</span>
          </NavLink>
        </nav>
        <a className="shell__back" href="https://www.joola.com">
          <NavIcon name="external" />
          <span>Back to joola.com</span>
        </a>
      </aside>
      <div className="shell__main">
        <header className="shell__topbar">
          <div
            className="rep-user"
            aria-label={`Signed in as ${rep.name}, ${rep.role}`}
          >
            <strong>{rep.name}</strong>
            <span>{rep.role}</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Avatar name={rep.name} />
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="shell__body">
          {children ?? <Outlet />}
          <p className="disclaimer-strip">{DISCLAIMER}</p>
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
