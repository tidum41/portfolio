import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  parseForceState,
  parseScreen,
  parseView,
  setDevConfig,
} from "../api/mock";
import { setPaused } from "../api/clock";
import { useStore } from "../state/Store";

/** Map DialKit screen keys to routes for clean/deep-link bootstrap. */
export function pathForScreen(
  view: "portal" | "admin",
  screen: string,
): string {
  if (view === "admin") {
    if (screen === "admin-orders") return "/admin/orders";
    if (screen === "approvals") return "/admin/approvals";
    return "/admin/orders";
  }
  if (screen === "order-history") return "/orders";
  if (screen === "login") return "/login";
  if (screen === "approvals") return "/quick-order";
  return `/${screen}`;
}

/**
 * Applies DialKit URL params and ensures the right session when ?clean=1
 * hides the playground UI.
 */
export function CleanBootstrap() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { session, bootstrapSession, switchAccount } = useStore();
  const lastLogin = useRef<string | null>(null);

  // Keep mock config + pause in sync with the URL.
  useEffect(() => {
    const view = parseView(params.get("view"));
    const screen = parseScreen(params.get("screen"), view);
    const state = parseForceState(params.get("state"));
    const accountId = params.get("account") ?? "dicks";
    const latency = Number(params.get("latency") ?? "0");
    const fail = Number(params.get("fail") ?? "0");
    const pause = params.get("pause") === "1";

    setDevConfig({
      view,
      screen,
      state,
      accountId,
      latencyMs: Number.isFinite(latency) ? latency : 0,
      failureRate: Number.isFinite(fail) ? fail : 0,
    });
    setPaused(pause);
  }, [params]);

  // Session bootstrap for clean screenshots / deep links.
  useEffect(() => {
    const view = parseView(params.get("view"));
    const screen = parseScreen(params.get("screen"), view);
    const accountId = params.get("account") ?? "dicks";
    const wantAdmin = view === "admin";

    if (screen === "login") return;

    const roleOk = wantAdmin
      ? session?.role === "admin"
      : Boolean(session && session.role === "buyer");

    if (roleOk) {
      if (session && session.accountId !== accountId) switchAccount(accountId);
      lastLogin.current = null;
      const search = window.location.search;
      const target = pathForScreen(wantAdmin ? "admin" : "portal", screen);
      const path = window.location.pathname;
      // Leave /dev/* and /prototypes/* harnesses alone.
      if (path.startsWith("/dev/") || path.startsWith("/prototypes/")) return;
      // After RequireAdmin/RequireBuyer bounce through /login, land on the
      // requested screen — never hardcode approvals for every admin deep link.
      if (wantAdmin && path !== target) {
        navigate(`${target}${search}`, { replace: true });
      } else if (
        !wantAdmin &&
        (path.startsWith("/login") || path === "/")
      ) {
        navigate(`${target}${search}`, { replace: true });
      }
      return;
    }

    const key = wantAdmin ? `admin:${accountId}` : `buyer:${accountId}`;
    if (lastLogin.current === key) return;
    lastLogin.current = key;

    // Bypass mock API so error/offline DialKit states still open the screen.
    bootstrapSession(
      wantAdmin ? "admin@joola.com" : "maya.okonkwo@dicks.com",
      wantAdmin,
    );
    switchAccount(accountId);
  }, [params, session, bootstrapSession, switchAccount, navigate]);

  return null;
}
