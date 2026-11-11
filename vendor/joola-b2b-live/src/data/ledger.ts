/**
 * Mock wholesale ledger for the JOOLA B2B live prototype.
 * Illustrative accounts and numbers only. Real wholesale figures cannot be disclosed.
 */

export type ProductCategory =
  | "Paddles"
  | "Balls"
  | "Bags"
  | "Nets"
  | "Grips"
  | "Accessories"
  | "Apparel";

export type Product = {
  id: string;
  sku: string;
  name: string;
  fullName: string;
  category: ProductCategory;
  msrp: number;
  image: string;
  moq: number;
  presets: number[];
  /** One account price. It does not change with quantity. */
  buyerPrice: number;
};

export type Line = {
  productId: string;
  qty: number;
  /** Optional fixed line total for fixture orders that must hit an exact amount. */
  amount?: number;
};

export type Account = {
  id: string;
  name: string;
  buyer: string;
  buyerEmail: string;
  role: string;
  secondaryContacts: { name: string; role: string }[];
  creditLimit: number;
  creditRemaining: number;
  shipTos: { id: string; name: string; site: string; detail: string }[];
};

export type SavedOrder = {
  id: string;
  name: string;
  savedBy: string;
  updated: string;
  lastOrdered: string;
  lines: Line[];
  kind: "template" | "past";
};

export type PastOrder = {
  id: string;
  label: string;
  when: string;
  status: string;
  lines: Line[];
  total: number;
  placedBy: string;
};

export type Invoice = {
  id: string;
  order: string;
  issued: string;
  due: string;
  amount: number;
  status: "Processing" | "Due" | "Overdue" | "Paid";
  open: boolean;
  receiptId?: string;
};

export type Message = {
  id: string;
  from: "buyer" | "staff";
  author: string;
  body: string;
  time: string;
};

export type Thread = {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  orderId?: string;
  lineCount?: number;
  messages: Message[];
};

export type ApprovalRow = {
  id: string;
  accountId: string;
  distributor: string;
  so: string;
  buyer: string;
  detail?: string;
  orderTotal: number;
  remaining: number;
  creditLimit: number;
  overdue: number;
  overdueInvs?: string[];
  status: "over" | "ar";
  lines: Line[];
};

/** Admin recent-orders board (auto-approved within limit). */
export type AdminOrder = {
  id: string;
  so: string;
  accountId: string;
  distributor: string;
  buyer: string;
  placed: string;
  total: number;
  status: "Auto-approved" | "Shipped" | "Fulfilled";
  lines: Line[];
  creditLimit: number;
  creditRemainingAfter: number;
};

const IMG = "/products";

/** One account price per SKU. Case-pack presets are quantity steps only. */
export const PRODUCTS: Record<string, Product> = {
  perseus: {
    id: "perseus",
    sku: "600558",
    name: "Perseus Pro V",
    fullName: "Perseus Pro V",
    category: "Paddles",
    msrp: 299.95,
    image: `${IMG}/perseus.webp`,
    moq: 6,
    presets: [6, 12, 24],
    buyerPrice: 165.57,
  },
  hyperion: {
    id: "hyperion",
    sku: "300829",
    name: "Hyperion Pro IV",
    fullName: "Hyperion Pro IV 14mm",
    category: "Paddles",
    msrp: 229.95,
    image: `${IMG}/hyperion.webp`,
    moq: 6,
    presets: [6, 12, 24],
    buyerPrice: 131.07,
  },
  scorpeus: {
    id: "scorpeus",
    sku: "600567",
    name: "Scorpeus Pro V",
    fullName: "Scorpeus Pro V",
    category: "Paddles",
    msrp: 299.95,
    image: `${IMG}/scorpeus.webp`,
    moq: 6,
    presets: [6, 12, 24],
    buyerPrice: 170.97,
  },
  magnus: {
    id: "magnus",
    sku: "600612",
    name: "Magnus Pro IV",
    fullName: "Magnus Pro IV 14mm",
    category: "Paddles",
    msrp: 249.95,
    image: `${IMG}/magnus.webp`,
    moq: 6,
    presets: [6, 12, 24],
    buyerPrice: 149.97,
  },
  hc40: {
    id: "hc40",
    sku: "600091",
    name: "HC-40 Balls",
    fullName: "HC-40 Outdoor Balls (3-Pack)",
    category: "Balls",
    msrp: 9.95,
    image: `${IMG}/hc40.webp`,
    moq: 12,
    presets: [12, 48, 96],
    buyerPrice: 5.82,
  },
  tourbag: {
    id: "tourbag",
    sku: "700214",
    name: "Tour Elite Bag",
    fullName: "Tour Elite Pickleball Bag",
    category: "Bags",
    msrp: 89.95,
    image: `${IMG}/tourbag.webp`,
    moq: 3,
    presets: [3, 6, 12],
    buyerPrice: 47.67,
  },
  netset: {
    id: "netset",
    sku: "800101",
    name: "Compact Practice Net",
    fullName: "Compact Pickleball Practice Net",
    category: "Nets",
    msrp: 179.95,
    image: `${IMG}/netset.webp`,
    moq: 2,
    presets: [2, 4, 8],
    buyerPrice: 98.97,
  },
  overgrip: {
    id: "overgrip",
    sku: "900330",
    name: "Pro Overgrip",
    fullName: "Pro Overgrip (3-Pack)",
    category: "Grips",
    msrp: 9.95,
    image: `${IMG}/overgrip.webp`,
    moq: 24,
    presets: [24, 60, 120],
    buyerPrice: 5.17,
  },
  edgetape: {
    id: "edgetape",
    sku: "900441",
    name: "Edge Guard Tape",
    fullName: "Pro V Pickleball Protective Edge Guard Tape",
    category: "Accessories",
    msrp: 12.95,
    image: `${IMG}/edgetape.webp`,
    moq: 12,
    presets: [12, 24, 48],
    buyerPrice: 7.47,
  },
  clubhoodie: {
    id: "clubhoodie",
    sku: "500088",
    name: "Club Hoodie",
    fullName: "Club Hoodie",
    category: "Apparel",
    msrp: 64.95,
    image: `${IMG}/tourbag.webp`,
    moq: 6,
    presets: [6, 12, 24],
    buyerPrice: 38.97,
  },
};

export const PRODUCT_IDS = Object.keys(PRODUCTS);

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function moneyWhole(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/** Account price. Quantity does not change it. */
export function priceAt(product: Product, _qty?: number) {
  return product.buyerPrice;
}

export function lineAmount(product: Product, qty: number, line?: Line) {
  if (line?.amount != null) return Math.round(line.amount * 100) / 100;
  return Math.round(priceAt(product, qty) * qty * 100) / 100;
}

export function linesTotal(lines: Line[]) {
  return (
    Math.round(
      lines.reduce((sum, line) => {
        const p = PRODUCTS[line.productId];
        return sum + (p ? lineAmount(p, line.qty, line) : 0);
      }, 0) * 100,
    ) / 100
  );
}

export function linesUnits(lines: Line[]) {
  return lines.reduce((s, l) => s + l.qty, 0);
}

function orderFromLines(
  partial: Omit<PastOrder, "total"> & { total?: number },
): PastOrder {
  const total = linesTotal(partial.lines);
  return { ...partial, total };
}

export const ACCOUNTS: Account[] = [
  {
    id: "dicks",
    name: "Dick's Sporting Goods",
    buyer: "Maya Okonkwo",
    buyerEmail: "maya.okonkwo@dicks.com",
    role: "Buyer",
    secondaryContacts: [
      { name: "LeBron James", role: "Secondary buyer" },
      { name: "Alex Chen", role: "Accounts payable" },
      { name: "Riley Brooks", role: "Store ops" },
    ],
    creditLimit: 25000,
    // Before the demo cart: $6,624.26 in use, $18,375.74 left.
    // After $8,467.08: $15,091.34 in use, $9,908.66 left.
    creditRemaining: 18375.74,
    shipTos: [
      {
        id: "dsg-main",
        name: "Dick's Sporting Goods",
        site: "Main warehouse",
        detail: "1847 Industrial Blvd, Austin TX",
      },
      {
        id: "dsg-north",
        name: "Dick's Sporting Goods",
        site: "North warehouse",
        detail: "2200 Research Park, Round Rock TX",
      },
    ],
  },
  {
    id: "baseline",
    name: "Baseline Pickleball Co.",
    buyer: "Jordan Hale",
    buyerEmail: "jordan.hale@baselinepb.com",
    role: "Buyer",
    secondaryContacts: [
      { name: "Kevin Durant", role: "Secondary buyer" },
      { name: "Casey Nguyen", role: "Ops" },
    ],
    creditLimit: 25000,
    creditRemaining: 18440,
    shipTos: [
      {
        id: "base-main",
        name: "Baseline Pickleball Co.",
        site: "HQ warehouse",
        detail: "88 Rally Ave, Denver CO",
      },
    ],
  },
  {
    id: "courtside",
    name: "Courtside Supply",
    buyer: "Sam Rivera",
    buyerEmail: "sam.rivera@courtsidesupply.com",
    role: "Buyer",
    secondaryContacts: [
      { name: "Patrick Mahomes", role: "Secondary buyer" },
      { name: "Morgan Ellis", role: "Receiving" },
    ],
    creditLimit: 25000,
    creditRemaining: 19875,
    shipTos: [
      {
        id: "court-main",
        name: "Courtside Supply",
        site: "Distribution center",
        detail: "410 Court St, Phoenix AZ",
      },
    ],
  },
  {
    id: "rallyhouse",
    name: "Rally House PB",
    buyer: "Taylor Kim",
    buyerEmail: "taylor.kim@rallyhousepb.example",
    role: "Buyer",
    secondaryContacts: [{ name: "Jamie Ortiz", role: "Secondary buyer" }],
    creditLimit: 15000,
    creditRemaining: 11240,
    shipTos: [
      {
        id: "rh-main",
        name: "Rally House PB",
        site: "Store warehouse",
        detail: "12 Spin St, San Diego CA",
      },
    ],
  },
  {
    id: "netzone",
    name: "NetZone Club Shop",
    buyer: "Avery Cole",
    buyerEmail: "avery.cole@netzone.example",
    role: "Buyer",
    secondaryContacts: [{ name: "Drew Patel", role: "Club manager" }],
    creditLimit: 12000,
    creditRemaining: 8640,
    shipTos: [
      {
        id: "nz-main",
        name: "NetZone Club Shop",
        site: "Club pro shop",
        detail: "500 Court Club Dr, Atlanta GA",
      },
    ],
  },
  {
    id: "spinlab",
    name: "Spin Lab Pro Shop",
    buyer: "Cameron Blake",
    buyerEmail: "cameron.blake@spinlab.example",
    role: "Buyer",
    secondaryContacts: [{ name: "Harper Quinn", role: "Secondary buyer" }],
    creditLimit: 18000,
    creditRemaining: 14120,
    shipTos: [
      {
        id: "sl-main",
        name: "Spin Lab Pro Shop",
        site: "Main floor",
        detail: "77 Dink Ave, Chicago IL",
      },
    ],
  },
  {
    id: "courtcraft",
    name: "CourtCraft Retail",
    buyer: "Jordan Miles",
    buyerEmail: "jordan.miles@courtcraft.example",
    role: "Buyer",
    secondaryContacts: [{ name: "Skyler Reed", role: "Receiving" }],
    creditLimit: 20000,
    creditRemaining: 15680,
    shipTos: [
      {
        id: "cc-main",
        name: "CourtCraft Retail",
        site: "DC East",
        detail: "900 Baseline Rd, Charlotte NC",
      },
    ],
  },
  {
    id: "paddlepath",
    name: "Paddle Path Co-op",
    buyer: "Riley Santos",
    buyerEmail: "riley.santos@paddlepath.example",
    role: "Buyer",
    secondaryContacts: [{ name: "Devon Park", role: "Secondary buyer" }],
    creditLimit: 10000,
    creditRemaining: 7425,
    shipTos: [
      {
        id: "pp-main",
        name: "Paddle Path Co-op",
        site: "Member warehouse",
        detail: "33 Co-op Way, Portland OR",
      },
    ],
  },
];

/** JOOLA staff and pros. Never used as distributor buyers. */
export const JOOLA_STAFF = {
  collin: { name: "Collin Johns", role: "Sales rep" },
  anna: { name: "Anna Bright", role: "Sales ops" },
  ben: { name: "Ben Johns", role: "JOOLA pro" },
} as const;

export const RECOMMENDED_META: Record<
  string,
  { reason: string; detail: string }
> = {
  perseus: {
    reason: "Ordered most",
    detail: "4 of your last 6 orders included this SKU",
  },
  hyperion: {
    reason: "Your history",
    detail: "Last bought Sep 12, usually every 6 weeks",
  },
  scorpeus: {
    reason: "Low stock at your store",
    detail: "On-hand estimate: 8 units",
  },
  hc40: {
    reason: "Pairs with paddles",
    detail: "Ordered with Perseus 5 of 6 times",
  },
  overgrip: {
    reason: "High turn",
    detail: "Restocked on every paddle order this quarter",
  },
};

export const FULFILLMENT: Record<
  string,
  { warehouse: string; availability: string }
> = {
  perseus: { warehouse: "CA warehouse", availability: "In stock" },
  hyperion: { warehouse: "CA warehouse", availability: "In stock" },
  scorpeus: { warehouse: "TX warehouse", availability: "In stock" },
  magnus: { warehouse: "CA warehouse", availability: "In stock" },
  hc40: { warehouse: "CA warehouse", availability: "In stock" },
  tourbag: { warehouse: "TX warehouse", availability: "In stock" },
  netset: { warehouse: "CA warehouse", availability: "Ships in 3-5 days" },
  overgrip: { warehouse: "CA warehouse", availability: "In stock" },
  edgetape: { warehouse: "TX warehouse", availability: "Low stock" },
  clubhoodie: { warehouse: "CA warehouse", availability: "In stock" },
};

/** Realistic retail restock cart for Dick's. */
export const DEFAULT_CART: Line[] = [
  { productId: "perseus", qty: 24 },
  { productId: "hyperion", qty: 12 },
  { productId: "scorpeus", qty: 12 },
  { productId: "hc40", qty: 96 },
  { productId: "overgrip", qty: 60 },
];

export const INITIAL_SAVED: SavedOrder[] = [
  {
    id: "tpl-perseus",
    name: "Perseus restock",
    savedBy: "Riley Brooks",
    updated: "Sep 30, 2026",
    lastOrdered: "Sep 12, 2026",
    kind: "template",
    lines: [
      { productId: "perseus", qty: 24 },
      { productId: "overgrip", qty: 24 },
    ],
  },
  {
    id: "tpl-match",
    name: "Match kit",
    savedBy: "Maya Okonkwo",
    updated: "Aug 14, 2026",
    lastOrdered: "Aug 2, 2026",
    kind: "template",
    lines: [
      { productId: "hyperion", qty: 24 },
      { productId: "hc40", qty: 96 },
      { productId: "scorpeus", qty: 12 },
      { productId: "tourbag", qty: 6 },
    ],
  },
];

export const INITIAL_PAST_ORDERS: PastOrder[] = [
  orderFromLines({
    id: "PO-118",
    label: "Match week restock",
    when: "Sep 18, 2026",
    status: "Fulfilled",
    placedBy: "Maya Okonkwo",
    lines: [
      { productId: "perseus", qty: 12 },
      { productId: "hc40", qty: 48 },
      { productId: "hyperion", qty: 12 },
      { productId: "overgrip", qty: 24 },
    ],
  }),
  orderFromLines({
    id: "PO-104",
    label: "Back-to-school",
    when: "Jul 28, 2026",
    status: "Fulfilled",
    placedBy: "Maya Okonkwo",
    lines: [
      { productId: "perseus", qty: 24 },
      { productId: "scorpeus", qty: 24 },
      { productId: "hyperion", qty: 12 },
      { productId: "hc40", qty: 96 },
      { productId: "tourbag", qty: 6 },
    ],
  }),
  orderFromLines({
    id: "PO-098",
    label: "Club pack",
    when: "Jun 20, 2026",
    status: "Fulfilled",
    placedBy: "LeBron James",
    lines: [
      { productId: "perseus", qty: 24 },
      { productId: "hyperion", qty: 24 },
      { productId: "scorpeus", qty: 12 },
      { productId: "hc40", qty: 96 },
      { productId: "netset", qty: 4 },
    ],
  }),
];

/** Portal invoices: mostly paid; one open Net 30 not yet due; none overdue. */
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-1042",
    order: "SO-48213",
    issued: "Oct 20, 2026",
    due: "Nov 19, 2026",
    amount: 4908.66,
    status: "Due",
    open: true,
    receiptId: "RCP-1042",
  },
  {
    id: "INV-1039",
    order: "PO-118",
    issued: "Sep 18, 2026",
    due: "Oct 18, 2026",
    amount: linesTotal(INITIAL_PAST_ORDERS[0].lines),
    status: "Paid",
    open: false,
    receiptId: "RCP-1039",
  },
  {
    id: "INV-1021",
    order: "PO-110",
    issued: "Aug 12, 2026",
    due: "Sep 11, 2026",
    amount: 2140.5,
    status: "Paid",
    open: false,
    receiptId: "RCP-1021",
  },
  {
    id: "INV-1014",
    order: "PO-104",
    issued: "Jul 28, 2026",
    due: "Aug 27, 2026",
    amount: linesTotal(INITIAL_PAST_ORDERS[1].lines),
    status: "Paid",
    open: false,
    receiptId: "RCP-1014",
  },
  {
    id: "INV-1008",
    order: "PO-098",
    issued: "Jun 20, 2026",
    due: "Jul 20, 2026",
    amount: linesTotal(INITIAL_PAST_ORDERS[2].lines),
    status: "Paid",
    open: false,
    receiptId: "RCP-1008",
  },
];

export const INITIAL_THREADS: Thread[] = [
  {
    id: "restock",
    name: JOOLA_STAFF.collin.name,
    role: JOOLA_STAFF.collin.role,
    preview: "Perseus Pro V restock",
    time: "10:42 AM",
    orderId: "SO-48213",
    lineCount: 3,
    messages: [
      {
        id: "m1",
        from: "buyer",
        author: "Maya Okonkwo",
        body: "Perseus Pro V, SKU 600558. When can you restock 24 units?",
        time: "10:31 AM",
      },
      {
        id: "m2",
        from: "staff",
        author: "Collin Johns",
        body: "24 units of Perseus Pro V ship Fri, Oct 24. Invoice INV-1042 covers the restock on Net 30.",
        time: "10:42 AM",
      },
    ],
  },
  {
    id: "ship",
    name: JOOLA_STAFF.anna.name,
    role: JOOLA_STAFF.anna.role,
    preview: "PO-118 tracking",
    time: "Mon",
    orderId: "PO-118",
    lineCount: 4,
    messages: [
      {
        id: "m3",
        from: "staff",
        author: "Anna Bright",
        body: "PO-118 left the CA warehouse this morning. Tracking updates should show by end of day.",
        time: "Mon 9:14 AM",
      },
    ],
  },
  {
    id: "warranty",
    name: JOOLA_STAFF.ben.name,
    role: JOOLA_STAFF.ben.role,
    preview: "Return approved for 2 paddles",
    time: "Oct 2",
    lineCount: 2,
    messages: [
      {
        id: "m4",
        from: "staff",
        author: "Ben Johns",
        body: "Return approved for 2 paddles. Send them to the CA returns dock with RMA-441.",
        time: "Oct 2, 2:05 PM",
      },
    ],
  },
];

/**
 * Default approval queue: one flagged order (Dick's over limit).
 * Line amounts are fixed so the expandable total matches $18,447.52.
 */
export const INITIAL_APPROVALS: ApprovalRow[] = [
  {
    id: "dicks",
    accountId: "dicks",
    distributor: "Dick's Sporting Goods",
    so: "SO-48288",
    buyer: "Maya Okonkwo",
    detail: "Secondary: LeBron James",
    orderTotal: 18447.52,
    remaining: 12250,
    creditLimit: 25000,
    overdue: 0,
    status: "over",
    lines: [
      { productId: "perseus", qty: 48, amount: 6479.04 },
      { productId: "hyperion", qty: 48, amount: 4967.04 },
      { productId: "scorpeus", qty: 24, amount: 3239.52 },
      { productId: "hc40", qty: 100, amount: 3761.92 },
    ],
  },
];

/** DialKit stress state: Baseline overdue+over-limit and Courtside over-limit. */
export const APPROVALS_STRESS: ApprovalRow[] = [
  ...INITIAL_APPROVALS,
  {
    id: "baseline",
    accountId: "baseline",
    distributor: "Baseline Pickleball Co.",
    so: "SO-48301",
    buyer: "Jordan Hale",
    detail: "Secondary: Kevin Durant",
    orderTotal: 9620,
    remaining: 4100,
    creditLimit: 25000,
    overdue: 2840.5,
    overdueInvs: ["INV-2031", "INV-2044", "INV-2050", "INV-2058"],
    status: "ar",
    lines: [
      { productId: "perseus", qty: 48, amount: 6479.04 },
      { productId: "hyperion", qty: 24, amount: 2483.52 },
      { productId: "hc40", qty: 100, amount: 657.44 },
    ],
  },
  {
    id: "courtside",
    accountId: "courtside",
    distributor: "Courtside Supply",
    so: "SO-48312",
    buyer: "Sam Rivera",
    detail: "Secondary: Patrick Mahomes",
    orderTotal: 7125,
    remaining: 5200,
    creditLimit: 25000,
    overdue: 0,
    status: "over",
    lines: [
      { productId: "hyperion", qty: 36, amount: 3725.28 },
      { productId: "scorpeus", qty: 24, amount: 3399.72 },
    ],
  },
];

function adminOrder(
  partial: Omit<AdminOrder, "total"> & { total?: number },
): AdminOrder {
  const total = linesTotal(partial.lines);
  return { ...partial, total };
}

/** 12 recent auto-approved orders across 8 accounts. */
export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  adminOrder({
    id: "ao-1",
    so: "SO-48290",
    accountId: "dicks",
    distributor: "Dick's Sporting Goods",
    buyer: "Maya Okonkwo",
    placed: "Nov 8, 2026",
    status: "Auto-approved",
    creditLimit: 25000,
    creditRemainingAfter: 15091.34,
    lines: [
      { productId: "perseus", qty: 12 },
      { productId: "hc40", qty: 48 },
      { productId: "overgrip", qty: 24 },
    ],
  }),
  adminOrder({
    id: "ao-2",
    so: "SO-48286",
    accountId: "baseline",
    distributor: "Baseline Pickleball Co.",
    buyer: "Jordan Hale",
    placed: "Nov 7, 2026",
    status: "Shipped",
    creditLimit: 25000,
    creditRemainingAfter: 18440,
    lines: [
      { productId: "hyperion", qty: 24 },
      { productId: "scorpeus", qty: 12 },
      { productId: "hc40", qty: 96 },
    ],
  }),
  adminOrder({
    id: "ao-3",
    so: "SO-48281",
    accountId: "courtside",
    distributor: "Courtside Supply",
    buyer: "Sam Rivera",
    placed: "Nov 6, 2026",
    status: "Fulfilled",
    creditLimit: 25000,
    creditRemainingAfter: 19875,
    lines: [
      { productId: "magnus", qty: 12 },
      { productId: "tourbag", qty: 6 },
      { productId: "edgetape", qty: 24 },
    ],
  }),
  adminOrder({
    id: "ao-4",
    so: "SO-48277",
    accountId: "rallyhouse",
    distributor: "Rally House PB",
    buyer: "Taylor Kim",
    placed: "Nov 5, 2026",
    status: "Fulfilled",
    creditLimit: 15000,
    creditRemainingAfter: 11240,
    lines: [
      { productId: "perseus", qty: 12 },
      { productId: "hyperion", qty: 6 },
      { productId: "overgrip", qty: 60 },
    ],
  }),
  adminOrder({
    id: "ao-5",
    so: "SO-48270",
    accountId: "netzone",
    distributor: "NetZone Club Shop",
    buyer: "Avery Cole",
    placed: "Nov 4, 2026",
    status: "Fulfilled",
    creditLimit: 12000,
    creditRemainingAfter: 8640,
    lines: [
      { productId: "scorpeus", qty: 12 },
      { productId: "netset", qty: 4 },
      { productId: "hc40", qty: 48 },
    ],
  }),
  adminOrder({
    id: "ao-6",
    so: "SO-48264",
    accountId: "spinlab",
    distributor: "Spin Lab Pro Shop",
    buyer: "Cameron Blake",
    placed: "Nov 3, 2026",
    status: "Fulfilled",
    creditLimit: 18000,
    creditRemainingAfter: 14120,
    lines: [
      { productId: "magnus", qty: 24 },
      { productId: "hc40", qty: 96 },
      { productId: "clubhoodie", qty: 12 },
    ],
  }),
  adminOrder({
    id: "ao-7",
    so: "SO-48258",
    accountId: "courtcraft",
    distributor: "CourtCraft Retail",
    buyer: "Jordan Miles",
    placed: "Nov 2, 2026",
    status: "Fulfilled",
    creditLimit: 20000,
    creditRemainingAfter: 15680,
    lines: [
      { productId: "perseus", qty: 24 },
      { productId: "hyperion", qty: 12 },
      { productId: "tourbag", qty: 6 },
    ],
  }),
  adminOrder({
    id: "ao-8",
    so: "SO-48251",
    accountId: "paddlepath",
    distributor: "Paddle Path Co-op",
    buyer: "Riley Santos",
    placed: "Nov 1, 2026",
    status: "Fulfilled",
    creditLimit: 10000,
    creditRemainingAfter: 7425,
    lines: [
      { productId: "hyperion", qty: 12 },
      { productId: "overgrip", qty: 24 },
      { productId: "edgetape", qty: 12 },
    ],
  }),
  adminOrder({
    id: "ao-9",
    so: "SO-48244",
    accountId: "dicks",
    distributor: "Dick's Sporting Goods",
    buyer: "LeBron James",
    placed: "Oct 28, 2026",
    status: "Fulfilled",
    creditLimit: 25000,
    creditRemainingAfter: 17200,
    lines: [
      { productId: "scorpeus", qty: 24 },
      { productId: "hc40", qty: 96 },
      { productId: "netset", qty: 2 },
    ],
  }),
  adminOrder({
    id: "ao-10",
    so: "SO-48238",
    accountId: "baseline",
    distributor: "Baseline Pickleball Co.",
    buyer: "Jordan Hale",
    placed: "Oct 24, 2026",
    status: "Fulfilled",
    creditLimit: 25000,
    creditRemainingAfter: 20100,
    lines: [
      { productId: "perseus", qty: 12 },
      { productId: "magnus", qty: 12 },
      { productId: "overgrip", qty: 60 },
    ],
  }),
  adminOrder({
    id: "ao-11",
    so: "SO-48230",
    accountId: "rallyhouse",
    distributor: "Rally House PB",
    buyer: "Taylor Kim",
    placed: "Oct 21, 2026",
    status: "Fulfilled",
    creditLimit: 15000,
    creditRemainingAfter: 12800,
    lines: [
      { productId: "hc40", qty: 96 },
      { productId: "tourbag", qty: 3 },
      { productId: "clubhoodie", qty: 6 },
    ],
  }),
  adminOrder({
    id: "ao-12",
    so: "SO-48222",
    accountId: "spinlab",
    distributor: "Spin Lab Pro Shop",
    buyer: "Cameron Blake",
    placed: "Oct 18, 2026",
    status: "Fulfilled",
    creditLimit: 18000,
    creditRemainingAfter: 15550,
    lines: [
      { productId: "hyperion", qty: 12 },
      { productId: "scorpeus", qty: 6 },
      { productId: "edgetape", qty: 24 },
    ],
  }),
];

export const DISCLAIMER =
  "Illustrative demo data. Real wholesale figures and client accounts cannot be disclosed.";
