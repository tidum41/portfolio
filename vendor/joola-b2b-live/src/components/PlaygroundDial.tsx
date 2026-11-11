import { useEffect, useMemo, useRef } from "react";
import { DialRoot, useDialKitController } from "dialkit";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  bumpReplay,
  getDevConfig,
  parseForceState,
  parseScreen,
  parseView,
  setDevConfig,
  type ForceState,
  type ScreenKey,
  type ViewKey,
} from "../api/mock";
import { setPaused, stepForward } from "../api/clock";
import { ACCOUNTS, useStore } from "../state/Store";
import { setGuidesDialEnabled } from "./guidesDialState";

const PORTAL_SCREENS: { value: ScreenKey; label: string; path: string }[] = [
  { value: "login", label: "Login", path: "/login" },
  { value: "quick-order", label: "Quick order", path: "/quick-order" },
  { value: "catalog", label: "Catalog", path: "/catalog" },
  { value: "saved-orders", label: "Saved orders", path: "/saved-orders" },
  { value: "order-history", label: "Order history", path: "/orders" },
  { value: "cart", label: "Cart", path: "/cart" },
  { value: "review", label: "Review and place", path: "/review" },
  { value: "order-placed", label: "Order placed", path: "/order-placed" },
  { value: "invoices", label: "Invoices and terms", path: "/invoices" },
  { value: "messages", label: "Messages", path: "/messages" },
];

const ADMIN_SCREENS: { value: ScreenKey; label: string; path: string }[] = [
  { value: "admin-orders", label: "Recent orders", path: "/admin/orders" },
  { value: "approvals", label: "Approval queue", path: "/admin/approvals" },
];

const STATES: { value: ForceState; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
  { value: "syncing", label: "Syncing / saving" },
  { value: "success", label: "Success" },
  { value: "offline", label: "Offline" },
  { value: "break-long-names", label: "Break: long names" },
  { value: "break-huge-amounts", label: "Break: huge amounts" },
  { value: "break-100-lines", label: "Break: 100+ lines" },
  { value: "break-0-items", label: "Break: 0 items" },
  {
    value: "approvals-stress",
    label: "Approvals: multi-flagged",
  },
];

function pathFor(view: ViewKey, screen: ScreenKey) {
  const list = view === "admin" ? ADMIN_SCREENS : PORTAL_SCREENS;
  return (
    list.find((s) => s.value === screen)?.path ??
    (view === "admin" ? "/admin/orders" : "/quick-order")
  );
}

function screensFor(view: ViewKey) {
  return view === "admin" ? ADMIN_SCREENS : PORTAL_SCREENS;
}

function readClean(params: URLSearchParams) {
  return params.get("clean") === "1" || params.get("clean") === "true";
}

/**
 * DialKit playground: navigate view/screen/state, tune mock latency/failures,
 * switch account, pause/step/replay. Syncs to URL. Hidden when ?clean=1.
 */
export function PlaygroundDial() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { switchAccount, session, bootstrapSession, logout } = useStore();
  const clean = readClean(params);
  const applyingUrl = useRef(false);
  const lastUrl = useRef("");

  const initial = useMemo(() => {
    const view = parseView(params.get("view"));
    const screen = parseScreen(params.get("screen"), view);
    const state = parseForceState(params.get("state"));
    const accountId = params.get("account") ?? "dicks";
    const latency = Number(params.get("latency") ?? "450");
    const fail = Number(params.get("fail") ?? "0");
    const pause = params.get("pause") === "1";
    const guides = params.get("guides") === "1";
    return { view, screen, state, accountId, latency, fail, pause, guides };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- seed once from URL

  useEffect(() => {
    setDevConfig({
      view: initial.view,
      screen: initial.screen,
      state: initial.state,
      accountId: initial.accountId,
      latencyMs: Number.isFinite(initial.latency) ? initial.latency : 450,
      failureRate: Number.isFinite(initial.fail) ? initial.fail : 0,
    });
    setPaused(initial.pause);
    if (initial.accountId) switchAccount(initial.accountId);
    // Ensure a session exists so screens are reachable from playground.
    if (!session) {
      bootstrapSession(
        initial.view === "admin" ? "admin@joola.com" : "maya.okonkwo@dicks.com",
        initial.view === "admin",
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dial = useDialKitController(
    "Playground",
    {
      view: {
        type: "select",
        options: [
          { value: "portal", label: "Distributor portal" },
          { value: "admin", label: "JOOLA sales admin" },
        ],
        default: initial.view,
      },
      screen: {
        type: "select",
        options: screensFor(initial.view).map((s) => ({
          value: s.value,
          label: s.label,
        })),
        default: initial.screen,
      },
      state: {
        type: "select",
        options: STATES,
        default: initial.state,
      },
      latencyMs: [initial.latency || 450, 0, 3000, 50],
      failureRate: [initial.fail || 0, 0, 1, 0.05],
      account: {
        type: "select",
        options: ACCOUNTS.map((a) => ({ value: a.id, label: a.name })),
        default: initial.accountId,
      },
      pause: initial.pause,
      guides: initial.guides,
      transport: {
        _collapsed: false,
        stepForward: { type: "action", label: "Step forward" },
        replay: { type: "action", label: "Replay" },
      },
    },
    {
      id: "joola-playground",
      defaultCollapsed: true,
      onAction(path) {
        if (path === "transport.stepForward") stepForward();
        if (path === "transport.replay") bumpReplay();
      },
    },
  );

  const values = dial.values;

  useEffect(() => {
    setGuidesDialEnabled(Boolean(values.guides));
    return () => setGuidesDialEnabled(false);
  }, [values.guides]);

  // Keep screen select options aligned with view.
  useEffect(() => {
    const view = (values.view as ViewKey) || "portal";
    const options = screensFor(view);
    const current = values.screen as string;
    if (!options.some((o) => o.value === current)) {
      dial.setValue("screen", options[0].value);
    }
  }, [values.view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push dial -> store + URL + navigation.
  useEffect(() => {
    if (clean || applyingUrl.current) return;
    const view = parseView(String(values.view));
    const screen = parseScreen(String(values.screen), view);
    const state = parseForceState(String(values.state));
    const accountId = String(values.account || "dicks");
    const latencyMs = Number(values.latencyMs) || 0;
    const failureRate = Number(values.failureRate) || 0;
    const pause = Boolean(values.pause);

    setDevConfig({
      view,
      screen,
      state,
      accountId,
      latencyMs,
      failureRate,
    });
    setPaused(pause);
    switchAccount(accountId);

    if (screen === "login") {
      if (session) logout();
    } else if (view === "admin") {
      if (session?.role !== "admin") bootstrapSession("admin@joola.com", true);
    } else if (!session || session.role === "admin") {
      const email =
        ACCOUNTS.find((a) => a.id === accountId)?.buyerEmail ??
        "maya.okonkwo@dicks.com";
      bootstrapSession(email, false);
    }

    const next = new URLSearchParams(params);
    next.set("view", view);
    next.set("screen", screen);
    next.set("state", state);
    next.set("account", accountId);
    next.set("latency", String(latencyMs));
    next.set("fail", String(failureRate));
    if (pause) next.set("pause", "1");
    else next.delete("pause");
    if (values.guides) next.set("guides", "1");
    else next.delete("guides");
    // Preserve clean if present (should not mount, but keep param).
    if (params.get("clean")) next.set("clean", params.get("clean")!);

    const qs = next.toString();
    if (qs !== lastUrl.current) {
      lastUrl.current = qs;
      setParams(next, { replace: true });
    }

    // Leave /dev/* and /prototypes/* harnesses alone.
    if (
      window.location.pathname.startsWith("/dev/") ||
      window.location.pathname.startsWith("/prototypes/")
    )
      return;

    const target = pathFor(view, screen);
    if (!window.location.pathname.startsWith(target.split("?")[0])) {
      navigate({ pathname: target, search: `?${qs}` }, { replace: true });
    }
  }, [
    values.view,
    values.screen,
    values.state,
    values.account,
    values.latencyMs,
    values.failureRate,
    values.pause,
    values.guides,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL -> dial when user edits the address bar / follows a link.
  useEffect(() => {
    if (clean) return;
    const qs = params.toString();
    if (qs === lastUrl.current) return;
    lastUrl.current = qs;
    applyingUrl.current = true;
    const view = parseView(params.get("view"));
    const screen = parseScreen(params.get("screen"), view);
    const state = parseForceState(params.get("state"));
    dial.setValues({
      view,
      screen,
      state,
      account: params.get("account") ?? getDevConfig().accountId,
      latencyMs: Number(params.get("latency") ?? getDevConfig().latencyMs),
      failureRate: Number(params.get("fail") ?? getDevConfig().failureRate),
      pause: params.get("pause") === "1",
      guides: params.get("guides") === "1",
    });
    queueMicrotask(() => {
      applyingUrl.current = false;
    });
  }, [params, clean]); // eslint-disable-line react-hooks/exhaustive-deps

  if (clean) return null;

  return (
    <div data-dialkit-ignore>
      <DialRoot
        position="bottom-right"
        theme="light"
        defaultOpen={false}
        versions="menu"
        productionEnabled
      />
    </div>
  );
}

export function useCleanMode() {
  const [params] = useSearchParams();
  return readClean(params);
}
