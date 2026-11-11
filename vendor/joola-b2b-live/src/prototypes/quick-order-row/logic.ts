/**
 * Quick-order line math for the prototype playground.
 * Dick's Sporting Goods has one account price per SKU. Quantity never
 * changes that price. The stepper moves by the case pack.
 */
import { PRODUCTS, money } from "../../data/ledger";

export const ROW_IDS = [
  "perseus",
  "hyperion",
  "hc40",
  "overgrip",
  "netset",
  "tourbag",
] as const;

export type LineState = "empty" | "typed" | "max" | "oos" | "loading";

export type Mode = "edit" | "oos" | "loading";

export type Availability = "in" | "low" | "backorder";

export type Sku = {
  id: string;
  sku: string;
  fullName: string;
  category: string;
  image: string;
  /** Account price. Constant at every quantity. */
  price: number;
  /** Case pack. The quantity step. */
  pack: number;
  /** Units available. The stepper cannot pass this. */
  stock: number;
  availability: Availability;
  stockLabel: string;
  lastQty: number;
  lastDate: string;
};

export const VARIANTS = [
  { id: "1", label: "Compact" },
  { id: "2", label: "Cases" },
  { id: "3", label: "Reorder" },
  { id: "4", label: "Stock status" },
] as const;

export function parseVariant(value: string | null) {
  const found = VARIANTS.find((item) => item.id === value);
  return found ? found.id : "1";
}

export const LINE_STATES: { id: LineState; label: string }[] = [
  { id: "empty", label: "Empty" },
  { id: "typed", label: "Typed" },
  { id: "max", label: "Max" },
  { id: "oos", label: "Out of stock" },
  { id: "loading", label: "Loading" },
];

const ACCOUNTS: Record<
  (typeof ROW_IDS)[number],
  Omit<Sku, "id" | "sku" | "fullName" | "category" | "image">
> = {
  perseus: {
    price: 165.57,
    pack: 6,
    stock: 240,
    availability: "in",
    stockLabel: "In stock",
    lastQty: 24,
    lastDate: "Oct 14",
  },
  hyperion: {
    price: 131.07,
    pack: 6,
    stock: 18,
    availability: "low",
    stockLabel: "Low stock, 18 left",
    lastQty: 12,
    lastDate: "Sep 28",
  },
  hc40: {
    price: 5.82,
    pack: 12,
    stock: 480,
    availability: "in",
    stockLabel: "In stock",
    lastQty: 48,
    lastDate: "Oct 2",
  },
  overgrip: {
    price: 5.17,
    pack: 12,
    stock: 240,
    availability: "in",
    stockLabel: "In stock",
    lastQty: 24,
    lastDate: "Aug 19",
  },
  netset: {
    price: 98.97,
    pack: 2,
    stock: 40,
    availability: "backorder",
    stockLabel: "Backordered, ships Dec 2",
    lastQty: 4,
    lastDate: "Oct 30",
  },
  tourbag: {
    price: 47.67,
    pack: 3,
    stock: 36,
    availability: "in",
    stockLabel: "In stock",
    lastQty: 6,
    lastDate: "Sep 9",
  },
};

function accountSku(id: (typeof ROW_IDS)[number]): Sku {
  const source = PRODUCTS[id];
  return {
    id: source.id,
    sku: source.sku,
    fullName: source.fullName,
    category: source.category,
    image: source.image,
    ...ACCOUNTS[id],
  };
}

export const CATALOG: Sku[] = ROW_IDS.map(accountSku);

export function moneyLine(sku: Sku, qty: number) {
  return (Math.round(sku.price * 100) * qty) / 100;
}

export { money };

export function parseLine(value: string | null): LineState {
  const found = LINE_STATES.find((state) => state.id === value);
  return found ? found.id : "typed";
}

export function modeFor(line: LineState): Mode {
  if (line === "oos") return "oos";
  if (line === "loading") return "loading";
  return "edit";
}

/** Two cases, or the stock cap when two cases would pass it. */
export function qtyForLine(sku: Sku, line: LineState): number {
  if (line === "empty" || line === "oos" || line === "loading") return 0;
  if (line === "max") return sku.stock;
  return Math.min(sku.pack * 2, sku.stock);
}

export function qtysFor(line: LineState): Record<string, number> {
  const next: Record<string, number> = {};
  for (const sku of CATALOG) next[sku.id] = qtyForLine(sku, line);
  return next;
}

export function stepQty(qty: number, dir: 1 | -1, pack: number, stock: number) {
  if (dir < 0) {
    if (qty <= pack) return 0;
    return Math.floor((qty - 1) / pack) * pack;
  }
  if (qty >= stock) return stock;
  const next = qty < pack ? pack : qty + pack;
  return Math.min(stock, next);
}

export function commitQty(
  raw: string,
  pack: number,
  stock: number,
): { qty: number; notice: string } {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n) || n <= 0) return { qty: 0, notice: "" };
  if (n > stock) return { qty: stock, notice: `Only ${stock} in stock` };
  const snapped = n < pack ? pack : Math.round(n / pack) * pack;
  const qty = Math.min(stock, snapped);
  if (qty !== n) return { qty, notice: `Rounded to ${qty}` };
  return { qty, notice: "" };
}

export function caseCount(qty: number, pack: number) {
  return Math.floor(qty / pack);
}

export function stepCases(qty: number, dir: 1 | -1, pack: number, stock: number) {
  const cases = caseCount(qty, pack);
  if (dir < 0) return Math.max(0, cases - 1) * pack;
  const next = (cases + 1) * pack;
  return next > stock ? stock : next;
}

export function commitCases(
  raw: string,
  pack: number,
  stock: number,
): { qty: number; notice: string } {
  const n = Number(raw);
  if (!raw.trim() || !Number.isFinite(n) || n <= 0) return { qty: 0, notice: "" };
  const cases = Math.max(0, Math.round(n));
  const qty = cases * pack;
  if (qty > stock) return { qty: stock, notice: `Only ${stock} in stock` };
  return { qty, notice: "" };
}

export function caseWord(cases: number) {
  return cases === 1 ? "case" : "cases";
}

export function unitWord(units: number) {
  return units === 1 ? "unit" : "units";
}
