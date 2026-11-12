/**
 * Break-ui fixtures: plausible worst-case data for the live prototype.
 * Wired through the same mock API boundary as demo data.
 */

import type {
  Account,
  ApprovalRow,
  Invoice,
  Line,
  PastOrder,
  Product,
  SavedOrder,
  Thread,
} from "./ledger";
import { PRODUCTS } from "./ledger";

export type FixtureMode =
  | "demo"
  | "break"
  | "empty"
  | "huge"
  | "zero-items"
  | "approvals-stress";

const LONG_PRODUCT: Product = {
  ...PRODUCTS.perseus,
  id: "perseus-long",
  name: "Perseus Pro V Carbon Fiber 16mm Pro Player Edition with Extended Handle",
  fullName:
    "Perseus Pro V Carbon Fiber 16mm Pro Player Edition with Extended Handle",
};

export const BREAK_ACCOUNT: Account = {
  id: "northwind",
  name: "Aleksandra Wiśniewska-Kowalczyk Sporting Goods International Holdings",
  buyer: "Bartholomew Fitzgerald-Jones",
  buyerEmail:
    "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
  role: "Regional purchasing coordinator",
  secondaryContacts: [
    {
      name: "Jo",
      role: "Intern",
    },
    {
      name: "陳偉明",
      role: "AP lead",
    },
  ],
  creditLimit: 25000,
  creditRemaining: 0.01,
  shipTos: [
    {
      id: "nw-1",
      name: "Aleksandra Wiśniewska-Kowalczyk Sporting Goods International Holdings",
      site: "Primary consolidation warehouse and returns processing center",
      detail:
        "1847 Industrial Boulevard Suite 400 Building C, Austin TX 78701-9912",
    },
  ],
};

export function breakCartLines(): Line[] {
  return [
    { productId: "perseus", qty: 1000000 },
    { productId: "hyperion", qty: 999999 },
    { productId: "scorpeus", qty: 1 },
    { productId: "hc40", qty: 12 },
  ];
}

export function hugeCartLines(): Line[] {
  const ids = ["perseus", "hyperion", "scorpeus", "hc40"] as const;
  return Array.from({ length: 120 }, (_, i) => ({
    productId: ids[i % ids.length],
    qty: ((i % 6) + 1) * 6,
  }));
}

export function breakSavedOrders(): SavedOrder[] {
  return [
    {
      id: "tpl-long",
      name: "Q4 regional tournament restock for every store in the southwest division and overflow",
      savedBy: "Bartholomew Fitzgerald-Jones",
      updated: "Sep 30",
      lastOrdered: "Never ordered",
      kind: "template",
      lines: breakCartLines(),
    },
    {
      id: "tpl-one",
      name: "X",
      savedBy: "Jo",
      updated: "Aug 1",
      lastOrdered: "Aug 1",
      kind: "template",
      lines: [{ productId: "hc40", qty: 12 }],
    },
  ];
}

export function breakPastOrders(): PastOrder[] {
  return [
    {
      id: "PO-LONG-991188",
      label:
        "Emergency restock after hurricane inventory loss across 14 markets",
      when: "Sep 18, 2026",
      status: "Pending confirmation",
      total: 9999999.99,
      lines: hugeCartLines().slice(0, 8),
      placedBy: "Bartholomew Fitzgerald-Jones",
    },
  ];
}

export function breakInvoices(): Invoice[] {
  return [
    {
      id: "INV-999999999",
      order: "SO-999999999",
      issued: "Oct 3, 2026",
      due: "Nov 2, 2026",
      amount: 9999999.99,
      status: "Overdue",
      open: true,
    },
    {
      id: "INV-0",
      order: "PO-0",
      issued: "Sep 1, 2026",
      due: "Oct 1, 2026",
      amount: 0,
      status: "Paid",
      open: false,
      receiptId: "RCP-0",
    },
  ];
}

export function breakThreads(): Thread[] {
  return [
    {
      id: "long",
      name: "Bartholomew Fitzgerald-Jones",
      role: "Regional purchasing coordinator for the southwest division",
      preview:
        "Can you confirm restock timing for the Perseus Pro V Carbon Fiber 16mm Pro Player Edition with Extended Handle across every warehouse?",
      time: "10:42 AM",
      orderId: "SO-999999999",
      lineCount: 128,
      messages: [
        {
          id: "bm1",
          from: "buyer",
          author: "Bartholomew Fitzgerald-Jones",
          body: "bartholomew.fitzgerald@northwind-industries-holdings.example.com needs ship confirmation for 1,000,000 units.",
          time: "10:31 AM",
        },
      ],
    },
  ];
}

export function breakApprovals(): ApprovalRow[] {
  return [
    {
      id: "nw",
      accountId: "northwind",
      distributor:
        "Aleksandra Wiśniewska-Kowalczyk Sporting Goods International Holdings",
      so: "SO-999999999",
      buyer: "Bartholomew Fitzgerald-Jones",
      detail:
        "Secondary: bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      orderTotal: 9999999.99,
      remaining: 0.01,
      creditLimit: 25000,
      overdue: 888888.88,
      overdueInvs: [
        "INV-2031",
        "INV-2044",
        "INV-2050",
        "INV-2058",
        "INV-2066",
        "INV-2071",
      ],
      status: "ar",
      lines: breakCartLines(),
    },
  ];
}

export function breakProducts(): Record<string, Product> {
  return {
    ...PRODUCTS,
    perseus: LONG_PRODUCT,
  };
}
