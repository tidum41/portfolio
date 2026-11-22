/** Mock queue shared by the approval prototypes. Figures match docs/prototype-variants.md. */

export type Line = { sku: string; qty: number; amount: number };

export type QueueOrder = {
  id: string;
  account: string;
  so: string;
  buyer: string;
  order: number;
  limit: number;
  creditLeft: number;
  overBy: number;
  overdue: number;
  why: ("over-limit" | "overdue")[];
  lines: Line[];
};

export const DICKS_LINES: Line[] = [
  { sku: "Perseus Pro V", qty: 48, amount: 6479.04 },
  { sku: "Hyperion Pro IV 14mm", qty: 48, amount: 4967.04 },
  { sku: "Scorpeus Pro V", qty: 24, amount: 3239.52 },
  { sku: "HC-40 Outdoor Balls (3-Pack)", qty: 100, amount: 3761.92 },
];

export const QUEUE: QueueOrder[] = [
  {
    id: "dicks",
    account: "Dick's Sporting Goods",
    so: "SO-48288",
    buyer: "Maya Okonkwo",
    order: 18447.52,
    limit: 25000,
    creditLeft: 12250,
    overBy: 6197.52,
    overdue: 0,
    why: ["over-limit"],
    lines: DICKS_LINES,
  },
  {
    id: "baseline",
    account: "Baseline Pickleball Co.",
    so: "SO-48301",
    buyer: "Jordan Hale",
    order: 9620,
    limit: 25000,
    creditLeft: 4100,
    overBy: 5520,
    overdue: 2840.5,
    why: ["over-limit", "overdue"],
    lines: [
      { sku: "Perseus Pro V", qty: 40, amount: 4800 },
      { sku: "Hyperion Pro IV 14mm", qty: 24, amount: 3120 },
      { sku: "HC-40 Outdoor Balls (3-Pack)", qty: 200, amount: 1700 },
    ],
  },
  {
    id: "courtside",
    account: "Courtside Supply",
    so: "SO-48312",
    buyer: "Sam Rivera",
    order: 7125,
    limit: 25000,
    creditLeft: 5200,
    overBy: 1925,
    overdue: 0,
    why: ["over-limit"],
    lines: [
      { sku: "Scorpeus Pro V", qty: 24, amount: 4320 },
      { sku: "Pro Tour Bag", qty: 30, amount: 1590 },
      { sku: "Club Hoodie", qty: 20, amount: 1215 },
    ],
  },
];

export function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function usedBefore(order: QueueOrder) {
  return order.limit - order.creditLeft;
}
