import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CATALOG,
  modeFor,
  moneyLine,
  parseLine,
  qtysFor,
  type LineState,
  type Mode,
  type Sku,
} from "./logic";

export type PlayRow = {
  sku: Sku;
  qty: number;
  notice: string;
};

type Cart = { lines: number; units: number; total: number };

type PlayValue = {
  line: LineState;
  setLine: (next: LineState) => void;
  width: 1024 | 1280;
  setWidth: (next: 1024 | 1280) => void;
  mode: Mode;
  query: string;
  setQuery: (next: string) => void;
  rows: PlayRow[];
  onQty: (id: string, qty: number, notice?: string) => void;
  add: () => void;
  readyCount: number;
  readyUnits: number;
  cart: Cart;
};

const PlayContext = createContext<PlayValue | null>(null);

export function usePlay(): PlayValue {
  const value = useContext(PlayContext);
  if (!value) throw new Error("usePlay outside QuickOrderState");
  return value;
}

function parseWidth(value: string | null): 1024 | 1280 {
  return value === "1024" ? 1024 : 1280;
}

export function QuickOrderState({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const line = parseLine(params.get("line"));
  const width = parseWidth(params.get("w"));
  const mode = modeFor(line);
  const [query, setQuery] = useState("");
  const [qtys, setQtys] = useState<Record<string, number>>(() => qtysFor(line));
  const [notices, setNotices] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<Cart>({ lines: 0, units: 0, total: 0 });
  const [applied, setApplied] = useState(line);

  if (applied !== line) {
    setApplied(line);
    setQtys(qtysFor(line));
    setNotices({});
  }

  const setLine = useCallback(
    (next: LineState) => {
      const paramsNext = new URLSearchParams(params);
      paramsNext.set("line", next);
      setParams(paramsNext, { replace: true });
    },
    [params, setParams],
  );

  const setWidth = useCallback(
    (next: 1024 | 1280) => {
      const paramsNext = new URLSearchParams(params);
      paramsNext.set("w", String(next));
      setParams(paramsNext, { replace: true });
    },
    [params, setParams],
  );

  const onQty = useCallback(
    (id: string, qty: number, notice = "") => {
      if (mode !== "edit") return;
      setQtys((prev) => ({ ...prev, [id]: qty }));
      setNotices((prev) => ({ ...prev, [id]: notice }));
    },
    [mode],
  );

  const ready = CATALOG.filter(
    (sku) => mode === "edit" && (qtys[sku.id] ?? 0) > 0,
  );
  const readyUnits = ready.reduce((sum, sku) => sum + (qtys[sku.id] ?? 0), 0);

  const add = useCallback(() => {
    if (mode !== "edit") return;
    const adding = CATALOG.filter((sku) => (qtys[sku.id] ?? 0) > 0);
    if (adding.length === 0) {
      toast.error("Set a quantity before adding.");
      return;
    }
    const units = adding.reduce((sum, sku) => sum + (qtys[sku.id] ?? 0), 0);
    const total = adding.reduce(
      (sum, sku) => sum + moneyLine(sku, qtys[sku.id] ?? 0),
      0,
    );
    setCart((prev) => ({
      lines: prev.lines + adding.length,
      units: prev.units + units,
      total: Math.round((prev.total + total) * 100) / 100,
    }));
    toast.success(
      adding.length === 1
        ? "Added 1 line to cart"
        : `Added ${adding.length} lines to cart`,
    );
    setQtys((prev) => {
      const next = { ...prev };
      for (const sku of adding) next[sku.id] = 0;
      return next;
    });
    setNotices((prev) => {
      const next = { ...prev };
      for (const sku of adding) delete next[sku.id];
      return next;
    });
  }, [mode, qtys]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((sku) => {
      if (!q) return true;
      return (
        sku.fullName.toLowerCase().includes(q) ||
        sku.sku.includes(q) ||
        sku.category.toLowerCase().includes(q)
      );
    }).map((sku) => ({
      sku,
      qty: qtys[sku.id] ?? 0,
      notice: notices[sku.id] ?? "",
    }));
  }, [query, qtys, notices]);

  const value: PlayValue = {
    line,
    setLine,
    width,
    setWidth,
    mode,
    query,
    setQuery,
    rows,
    onQty,
    add,
    readyCount: ready.length,
    readyUnits,
    cart,
  };

  return <PlayContext.Provider value={value}>{children}</PlayContext.Provider>;
}
