/**
 * Mock API with configurable latency, failure, offline, empty overrides,
 * DialKit-driven pause/step via the playground clock.
 */

import { isPaused, waitIfPaused } from "./clock";

export type ScreenKey =
  | "login"
  | "quick-order"
  | "saved-orders"
  | "cart"
  | "review"
  | "order-placed"
  | "order-history"
  | "catalog"
  | "invoices"
  | "messages"
  | "approvals"
  | "admin-orders"
  | "account";

export type ForceState =
  | "default"
  | "loading"
  | "empty"
  | "error"
  | "offline"
  | "syncing"
  | "success"
  | "break-long-names"
  | "break-huge-amounts"
  | "break-100-lines"
  | "break-0-items"
  | "approvals-stress";

export type ViewKey = "portal" | "admin";

export type DevConfig = {
  view: ViewKey;
  screen: ScreenKey;
  /** Global forced UI state (DialKit / playground). */
  state: ForceState;
  /** Optional per-screen override of the global playground state. */
  force: Partial<Record<ScreenKey, ForceState>>;
  /** Fail the next N calls for a screen (then auto-clear). */
  failNext: Partial<Record<ScreenKey, number>>;
  latencyMs: number;
  /** 0..1 chance a mock call fails (after latency). */
  failureRate: number;
  accountId: string;
  offline: boolean;
  fixture: "demo" | "break" | "empty" | "huge" | "zero-items" | "approvals-stress";
};

type Listener = () => void;

const DEFAULT: DevConfig = {
  view: "portal",
  screen: "quick-order",
  state: "default",
  force: {},
  failNext: {},
  latencyMs: 450,
  failureRate: 0,
  accountId: "dicks",
  offline: false,
  fixture: "demo",
};

let config: DevConfig = { ...DEFAULT, force: {}, failNext: {} };
const listeners = new Set<Listener>();
let replayToken = 0;
const replayListeners = new Set<Listener>();

export function getDevConfig(): DevConfig {
  return config;
}

export function setDevConfig(patch: Partial<DevConfig>) {
  const next: DevConfig = {
    ...config,
    ...patch,
    force: patch.force ? { ...config.force, ...patch.force } : config.force,
    failNext: patch.failNext
      ? { ...config.failNext, ...patch.failNext }
      : config.failNext,
  };

  // Map state shortcuts onto fixture / offline for data seeding.
  if (patch.state) {
    switch (patch.state) {
      case "offline":
        next.offline = true;
        break;
      case "break-long-names":
      case "break-huge-amounts":
        next.fixture = "break";
        next.offline = false;
        break;
      case "break-100-lines":
        next.fixture = "huge";
        next.offline = false;
        break;
      case "break-0-items":
      case "empty":
        next.fixture = "empty";
        next.offline = false;
        break;
      case "approvals-stress":
        next.fixture = "approvals-stress";
        next.offline = false;
        break;
      default:
        if (
          patch.state === "default" ||
          patch.state === "loading" ||
          patch.state === "error" ||
          patch.state === "syncing" ||
          patch.state === "success"
        ) {
          next.fixture = "demo";
          next.offline = false;
        }
        break;
    }
  }

  config = next;
  listeners.forEach((l) => l());
}

export function resetDevConfig() {
  config = { ...DEFAULT, force: {}, failNext: {} };
  listeners.forEach((l) => l());
}

export function subscribeDevConfig(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function bumpReplay() {
  replayToken += 1;
  replayListeners.forEach((l) => l());
}

export function getReplayToken() {
  return replayToken;
}

export function subscribeReplay(listener: Listener) {
  replayListeners.add(listener);
  return () => {
    replayListeners.delete(listener);
  };
}

export class MockApiError extends Error {
  code: "network" | "offline" | "server" | "validation";
  fix: string;

  constructor(
    message: string,
    code: MockApiError["code"] = "server",
    fix = "",
  ) {
    super(message);
    this.name = "MockApiError";
    this.code = code;
    this.fix = fix;
  }
}

async function sleep(ms: number) {
  if (ms <= 0) {
    await waitIfPaused("tick");
    return;
  }
  const chunk = 50;
  let left = ms;
  while (left > 0) {
    await waitIfPaused("latency");
    const step = Math.min(chunk, left);
    await new Promise((r) => setTimeout(r, step));
    left -= step;
    if (isPaused()) {
      await waitIfPaused("latency-hold");
    }
  }
}

function effectiveState(screen: ScreenKey): ForceState {
  return config.force[screen] ?? config.state;
}

function isCleanMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("clean") === "1" || params.get("clean") === "true";
}

export async function mockRequest<T>(
  screen: ScreenKey,
  run: () => T | Promise<T>,
  opts?: { latencyMs?: number },
): Promise<T> {
  const state = effectiveState(screen);
  const clean = isCleanMode();
  const latency = clean
    ? 0
    : (opts?.latencyMs ??
      (state === "loading" ? Math.max(config.latencyMs, 1800) : config.latencyMs));

  await waitIfPaused(`request:${screen}`);
  await sleep(latency);
  await waitIfPaused(`after-latency:${screen}`);

  if (config.offline || state === "offline") {
    throw new MockApiError(
      "You appear to be offline.",
      "offline",
      "Check your connection, then try again. Unsaved cart lines stay on this device.",
    );
  }

  const fails = config.failNext[screen] ?? 0;
  if (fails > 0) {
    setDevConfig({ failNext: { [screen]: fails - 1 } });
    throw new MockApiError(
      "The page did not load.",
      "server",
      "Try again. If it keeps failing, message your JOOLA rep.",
    );
  }

  const roll = Math.random();
  if (state === "error" || (config.failureRate > 0 && roll < config.failureRate)) {
    throw new MockApiError(
      "The page did not load.",
      "server",
      "Try again. If it keeps failing, message your JOOLA rep.",
    );
  }

  return await run();
}

export function isForcedEmpty(screen?: ScreenKey) {
  const state = screen ? effectiveState(screen) : config.state;
  return (
    state === "empty" ||
    state === "break-0-items" ||
    config.fixture === "empty" ||
    config.fixture === "zero-items"
  );
}

export function isForcedSyncing(screen?: ScreenKey) {
  const state = screen ? effectiveState(screen) : config.state;
  return state === "syncing";
}

export function isForcedSuccess(screen?: ScreenKey) {
  const state = screen ? effectiveState(screen) : config.state;
  return state === "success";
}

export function isForcedLoading(screen?: ScreenKey) {
  const state = screen ? effectiveState(screen) : config.state;
  return state === "loading";
}

/** Map DialKit / URL state string onto ForceState. */
export function parseForceState(raw: string | null): ForceState {
  const allowed: ForceState[] = [
    "default",
    "loading",
    "empty",
    "error",
    "offline",
    "syncing",
    "success",
    "break-long-names",
    "break-huge-amounts",
    "break-100-lines",
    "break-0-items",
    "approvals-stress",
  ];
  if (raw && (allowed as string[]).includes(raw)) return raw as ForceState;
  return "default";
}

export function parseView(raw: string | null): ViewKey {
  return raw === "admin" ? "admin" : "portal";
}

export function parseScreen(raw: string | null, view: ViewKey): ScreenKey {
  const portal: ScreenKey[] = [
    "login",
    "quick-order",
    "catalog",
    "saved-orders",
    "order-history",
    "cart",
    "review",
    "order-placed",
    "invoices",
    "messages",
    "account",
  ];
  const admin: ScreenKey[] = ["approvals", "admin-orders"];
  const list = view === "admin" ? admin : portal;
  if (raw && (list as string[]).includes(raw)) return raw as ScreenKey;
  return view === "admin" ? "approvals" : "quick-order";
}
