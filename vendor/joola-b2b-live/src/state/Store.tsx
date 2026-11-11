import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getDevConfig,
  isForcedEmpty,
  mockRequest,
  subscribeDevConfig,
  type ScreenKey,
} from "../api/mock";
import {
  ACCOUNTS,
  APPROVALS_STRESS,
  DEFAULT_CART,
  INITIAL_ADMIN_ORDERS,
  INITIAL_APPROVALS,
  INITIAL_INVOICES,
  INITIAL_PAST_ORDERS,
  INITIAL_SAVED,
  INITIAL_THREADS,
  JOOLA_STAFF,
  PRODUCTS,
  linesTotal,
  type Account,
  type AdminOrder,
  type ApprovalRow,
  type Invoice,
  type Line,
  type PastOrder,
  type Product,
  type SavedOrder,
  type Thread,
} from "../data/ledger";
import {
  BREAK_ACCOUNT,
  breakApprovals,
  breakCartLines,
  breakInvoices,
  breakPastOrders,
  breakProducts,
  breakSavedOrders,
  breakThreads,
  hugeCartLines,
  type FixtureMode,
} from "../data/fixtures";

export type Role = "buyer" | "admin";

export type Session = {
  role: Role;
  accountId: string;
  email: string;
};

type StoreValue = {
  session: Session | null;
  account: Account | null;
  products: Record<string, Product>;
  cart: Line[];
  cartTotal: number;
  savedOrders: SavedOrder[];
  pastOrders: PastOrder[];
  invoices: Invoice[];
  threads: Thread[];
  approvals: ApprovalRow[];
  adminOrders: AdminOrder[];
  customerPo: string;
  shipToId: string;
  needBy: string;
  lastPlacedOrderId: string | null;
  syncing: boolean;
  fixture: FixtureMode;
  login: (email: string, asAdmin?: boolean) => Promise<void>;
  /** Set a session without hitting the mock API (clean/deep-link bootstrap). */
  bootstrapSession: (email: string, asAdmin?: boolean) => void;
  logout: () => void;
  switchAccount: (accountId: string) => void;
  setCartQty: (productId: string, qty: number) => void;
  addToCart: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  /** Restore a previously removed cart line (undo). */
  restoreCartLine: (line: Line) => void;
  replaceCart: (lines: Line[]) => void;
  clearCart: () => void;
  setCustomerPo: (v: string) => void;
  setShipToId: (v: string) => void;
  setNeedBy: (v: string) => void;
  placeOrder: () => Promise<{ orderId: string; needsApproval: boolean }>;
  renameSaved: (id: string, name: string) => Promise<void>;
  deleteSaved: (id: string) => Promise<void>;
  saveTemplate: (name: string, lines: Line[]) => Promise<void>;
  updateSavedLines: (id: string, lines: Line[]) => Promise<void>;
  sendMessage: (threadId: string, body: string) => Promise<void>;
  approveOverride: (id: string, reason: string) => Promise<void>;
  rejectOverride: (id: string, reason: string) => Promise<void>;
  /** Put an approval row back (undo reject/approve). */
  restoreApproval: (row: ApprovalRow) => void;
  /** Put a deleted saved order back (undo). */
  restoreSaved: (order: SavedOrder) => void;
  loadScreen: <T>(screen: ScreenKey, run: () => T | Promise<T>) => Promise<T>;
};

const StoreContext = createContext<StoreValue | null>(null);

function pickAccount(accountId: string, fixture: FixtureMode): Account {
  if (fixture === "break") return BREAK_ACCOUNT;
  return ACCOUNTS.find((a) => a.id === accountId) ?? ACCOUNTS[0];
}

function seedForFixture(fixture: FixtureMode) {
  if (fixture === "empty" || fixture === "zero-items") {
    return {
      products: PRODUCTS,
      cart: [] as Line[],
      savedOrders: [] as SavedOrder[],
      pastOrders: [] as PastOrder[],
      invoices: [] as Invoice[],
      threads: [] as Thread[],
      approvals: [] as ApprovalRow[],
      adminOrders: [] as AdminOrder[],
    };
  }
  if (fixture === "break") {
    return {
      products: breakProducts(),
      cart: breakCartLines(),
      savedOrders: breakSavedOrders(),
      pastOrders: breakPastOrders(),
      invoices: breakInvoices(),
      threads: breakThreads(),
      approvals: breakApprovals(),
      adminOrders: INITIAL_ADMIN_ORDERS.map((o) => ({
        ...o,
        lines: o.lines.map((l) => ({ ...l })),
      })),
    };
  }
  if (fixture === "huge") {
    return {
      products: PRODUCTS,
      cart: hugeCartLines(),
      savedOrders: INITIAL_SAVED,
      pastOrders: INITIAL_PAST_ORDERS,
      invoices: INITIAL_INVOICES,
      threads: INITIAL_THREADS,
      approvals: INITIAL_APPROVALS,
      adminOrders: INITIAL_ADMIN_ORDERS,
    };
  }
  if (fixture === "approvals-stress") {
    return {
      products: PRODUCTS,
      cart: DEFAULT_CART.map((l) => ({ ...l })),
      savedOrders: INITIAL_SAVED.map((s) => ({
        ...s,
        lines: s.lines.map((l) => ({ ...l })),
      })),
      pastOrders: INITIAL_PAST_ORDERS.map((o) => ({
        ...o,
        lines: o.lines.map((l) => ({ ...l })),
      })),
      invoices: [...INITIAL_INVOICES],
      threads: INITIAL_THREADS.map((t) => ({
        ...t,
        messages: [...t.messages],
      })),
      approvals: APPROVALS_STRESS.map((a) => ({
        ...a,
        lines: a.lines.map((l) => ({ ...l })),
      })),
      adminOrders: INITIAL_ADMIN_ORDERS.map((o) => ({
        ...o,
        lines: o.lines.map((l) => ({ ...l })),
      })),
    };
  }
  return {
    products: PRODUCTS,
    cart: DEFAULT_CART.map((l) => ({ ...l })),
    savedOrders: INITIAL_SAVED.map((s) => ({
      ...s,
      lines: s.lines.map((l) => ({ ...l })),
    })),
    pastOrders: INITIAL_PAST_ORDERS.map((o) => ({
      ...o,
      lines: o.lines.map((l) => ({ ...l })),
    })),
    invoices: [...INITIAL_INVOICES],
    threads: INITIAL_THREADS.map((t) => ({
      ...t,
      messages: [...t.messages],
    })),
    approvals: INITIAL_APPROVALS.map((a) => ({
      ...a,
      lines: a.lines.map((l) => ({ ...l })),
    })),
    adminOrders: INITIAL_ADMIN_ORDERS.map((o) => ({
      ...o,
      lines: o.lines.map((l) => ({ ...l })),
    })),
  };
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem("joola-session");
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  useEffect(() => {
    if (session) sessionStorage.setItem("joola-session", JSON.stringify(session));
    else sessionStorage.removeItem("joola-session");
  }, [session]);
  const [fixture, setFixture] = useState<FixtureMode>("demo");
  const seed = useMemo(() => seedForFixture(fixture), [fixture]);
  const [cart, setCart] = useState<Line[]>(seed.cart);
  const [savedOrders, setSavedOrders] = useState(seed.savedOrders);
  const [pastOrders, setPastOrders] = useState(seed.pastOrders);
  const [invoices, setInvoices] = useState(seed.invoices);
  const [threads, setThreads] = useState(seed.threads);
  const [approvals, setApprovals] = useState(seed.approvals);
  const [adminOrders, setAdminOrders] = useState(seed.adminOrders);
  const [products, setProducts] = useState(seed.products);
  const [customerPo, setCustomerPo] = useState("");
  const [shipToId, setShipToId] = useState(ACCOUNTS[0].shipTos[0].id);
  const [needBy, setNeedBy] = useState("");
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(
    null,
  );
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    return subscribeDevConfig(() => {
      setFixture(getDevConfig().fixture);
    });
  }, []);

  useEffect(() => {
    const s = seedForFixture(fixture);
    setProducts(s.products);
    setCart(s.cart);
    setSavedOrders(s.savedOrders);
    setPastOrders(s.pastOrders);
    setInvoices(s.invoices);
    setThreads(s.threads);
    setApprovals(s.approvals);
    setAdminOrders(s.adminOrders);
  }, [fixture]);

  const account = session
    ? pickAccount(session.accountId, fixture)
    : null;

  useEffect(() => {
    if (account?.shipTos[0]) setShipToId(account.shipTos[0].id);
  }, [account?.id]);

  const cartTotal = useMemo(() => linesTotal(cart), [cart]);

  const applySession = useCallback((email: string, asAdmin = false) => {
    const match =
      ACCOUNTS.find((acct) => acct.buyerEmail === email) ??
      (email.toLowerCase().includes("admin") ? ACCOUNTS[0] : undefined) ??
      ACCOUNTS[0];
    setSession({
      role: asAdmin || email.toLowerCase().includes("admin") ? "admin" : "buyer",
      accountId: match.id,
      email: email || match.buyerEmail,
    });
  }, []);

  const login = useCallback(
    async (email: string, asAdmin = false) => {
      await mockRequest("login", () => null);
      applySession(email, asAdmin);
    },
    [applySession],
  );

  const bootstrapSession = useCallback(
    (email: string, asAdmin = false) => {
      applySession(email, asAdmin);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    setSession(null);
    setLastPlacedOrderId(null);
  }, []);

  const switchAccount = useCallback((accountId: string) => {
    setSession((prev) => (prev ? { ...prev, accountId } : prev));
  }, []);

  const setCartQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      if (qty > 0) next.push({ productId, qty });
      return next;
    });
  }, []);

  const addToCart = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const restoreCartLine = useCallback((line: Line) => {
    setCart((prev) => {
      if (prev.some((l) => l.productId === line.productId)) {
        return prev.map((l) =>
          l.productId === line.productId ? { ...line } : l,
        );
      }
      return [...prev, { ...line }];
    });
  }, []);

  const replaceCart = useCallback((lines: Line[]) => {
    setCart(lines.map((l) => ({ ...l })));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(async () => {
    setSyncing(true);
    try {
      return await mockRequest("review", () => {
        const orderId = `SO-${48200 + Math.floor(Math.random() * 90)}`;
        const remaining = account?.creditRemaining ?? 0;
        const needsApproval = cartTotal > remaining;
        setLastPlacedOrderId(orderId);
        setPastOrders((prev) => [
          {
            id: orderId,
            label: customerPo || "Wholesale order",
            when: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: needsApproval ? "Pending approval" : "Pending Fulfillment",
            total: cartTotal,
            lines: cart.map((l) => ({ ...l })),
            placedBy: account?.buyer ?? "Buyer",
          },
          ...prev,
        ]);
        if (needsApproval && account) {
          setApprovals((prev) => [
            {
              id: orderId,
              accountId: account.id,
              distributor: account.name,
              so: orderId,
              buyer: account.buyer,
              orderTotal: cartTotal,
              remaining: account.creditRemaining,
              creditLimit: account.creditLimit,
              overdue: 0,
              status: "over",
              lines: cart.map((l) => ({ ...l })),
            },
            ...prev,
          ]);
        }
        setCart([]);
        return { orderId, needsApproval };
      });
    } finally {
      setSyncing(false);
    }
  }, [account, cart, cartTotal, customerPo]);

  const renameSaved = useCallback(async (id: string, name: string) => {
    const prev = savedOrders;
    setSavedOrders((list) =>
      list.map((s) => (s.id === id ? { ...s, name } : s)),
    );
    try {
      await mockRequest("saved-orders", () => null, { latencyMs: 280 });
    } catch (e) {
      setSavedOrders(prev);
      throw e;
    }
  }, [savedOrders]);

  const deleteSaved = useCallback(async (id: string) => {
    const prev = savedOrders;
    setSavedOrders((list) => list.filter((s) => s.id !== id));
    try {
      await mockRequest("saved-orders", () => null, { latencyMs: 280 });
    } catch (e) {
      setSavedOrders(prev);
      throw e;
    }
  }, [savedOrders]);

  const saveTemplate = useCallback(async (name: string, lines: Line[]) => {
    const tpl: SavedOrder = {
      id: `tpl-${Date.now()}`,
      name,
      savedBy: account?.buyer ?? "You",
      updated: "Just now",
      lastOrdered: "Not yet",
      kind: "template",
      lines: lines.map((l) => ({ ...l })),
    };
    setSavedOrders((list) => [tpl, ...list]);
    await mockRequest("saved-orders", () => null, { latencyMs: 320 });
  }, [account]);

  const updateSavedLines = useCallback(async (id: string, lines: Line[]) => {
    const prev = savedOrders;
    setSavedOrders((list) =>
      list.map((s) => (s.id === id ? { ...s, lines, updated: "Just now" } : s)),
    );
    try {
      await mockRequest("saved-orders", () => null, { latencyMs: 280 });
    } catch (e) {
      setSavedOrders(prev);
      throw e;
    }
  }, [savedOrders]);

  const sendMessage = useCallback(async (threadId: string, body: string) => {
    const msg = {
      id: `m-${Date.now()}`,
      from: "buyer" as const,
      author: account?.buyer ?? "You",
      body,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setThreads((list) =>
      list.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, msg], preview: body, time: msg.time }
          : t,
      ),
    );
    await mockRequest("messages", () => null, { latencyMs: 300 });
  }, [account]);

  const approveOverride = useCallback(async (id: string, reason: string) => {
    if (!reason.trim()) throw new Error("Reason required");
    await mockRequest("approvals", () => null, { latencyMs: 400 });
    setApprovals((list) => list.filter((a) => a.id !== id));
  }, []);

  const rejectOverride = useCallback(async (id: string, reason: string) => {
    if (!reason.trim()) throw new Error("Reason required");
    await mockRequest("approvals", () => null, { latencyMs: 400 });
    setApprovals((list) => list.filter((a) => a.id !== id));
  }, []);

  const restoreApproval = useCallback((row: ApprovalRow) => {
    setApprovals((list) => {
      if (list.some((a) => a.id === row.id)) return list;
      return [row, ...list];
    });
  }, []);

  const restoreSaved = useCallback((order: SavedOrder) => {
    setSavedOrders((list) => {
      if (list.some((s) => s.id === order.id)) return list;
      return [order, ...list];
    });
  }, []);

  const loadScreen = useCallback(
    async <T,>(screen: ScreenKey, run: () => T | Promise<T>) => {
      if (isForcedEmpty(screen)) {
        return mockRequest(screen, async () => run());
      }
      return mockRequest(screen, run);
    },
    [],
  );

  const value: StoreValue = {
    session,
    account,
    products,
    cart,
    cartTotal,
    savedOrders,
    pastOrders,
    invoices,
    threads,
    approvals,
    adminOrders,
    customerPo,
    shipToId,
    needBy,
    lastPlacedOrderId,
    syncing,
    fixture,
    login,
    bootstrapSession,
    logout,
    switchAccount,
    setCartQty,
    addToCart,
    removeFromCart,
    restoreCartLine,
    replaceCart,
    clearCart,
    setCustomerPo,
    setShipToId,
    setNeedBy,
    placeOrder,
    renameSaved,
    deleteSaved,
    saveTemplate,
    updateSavedLines,
    sendMessage,
    approveOverride,
    rejectOverride,
    restoreApproval,
    restoreSaved,
    loadScreen,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { JOOLA_STAFF, ACCOUNTS };
