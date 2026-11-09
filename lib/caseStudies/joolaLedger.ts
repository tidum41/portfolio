/**
 * Mock wholesale ledger for JOOLA B2B case-study live components.
 * Ported from the pass-42 prototype ledger.js. Numbers are mocked.
 */

export type Tier = { min: number; price: number };

export type JoolaProduct = {
  id: string;
  sku: string;
  name: string;
  fullName: string;
  category: string;
  msrp: number;
  image: string;
  moq: number;
  presets: number[];
  tiers: Tier[];
  buyerPrice: number;
};

const PRESETS = {
  Paddles: [6, 12, 24],
  Balls: [12, 48, 100],
  Bags: [1, 3, 6],
} as const;

const IMG = "/images/joola/products";

function withBuyerPrice(
  p: Omit<JoolaProduct, "buyerPrice">,
): JoolaProduct {
  return { ...p, buyerPrice: p.tiers[p.tiers.length - 1].price };
}

export const JOOLA_PRODUCTS: Record<string, JoolaProduct> = {
  perseus: withBuyerPrice({
    id: "perseus",
    sku: "600558",
    name: "Perseus Pro V",
    fullName: "Perseus Pro V",
    category: "Paddles",
    msrp: 299.95,
    image: `${IMG}/perseus.jpg`,
    moq: 1,
    presets: [...PRESETS.Paddles],
    tiers: [
      { min: 1, price: 179.97 },
      { min: 6, price: 164.97 },
      { min: 12, price: 149.98 },
      { min: 24, price: 134.98 },
    ],
  }),
  hyperion: withBuyerPrice({
    id: "hyperion",
    sku: "300829",
    name: "Hyperion Pro IV",
    fullName: "Hyperion Pro IV 14mm",
    category: "Paddles",
    msrp: 229.95,
    image: `${IMG}/hyperion.jpg`,
    moq: 1,
    presets: [...PRESETS.Paddles],
    tiers: [
      { min: 1, price: 137.97 },
      { min: 6, price: 126.47 },
      { min: 12, price: 114.98 },
      { min: 24, price: 103.48 },
    ],
  }),
  scorpeus: withBuyerPrice({
    id: "scorpeus",
    sku: "600567",
    name: "Scorpeus Pro V",
    fullName: "Scorpeus Pro V",
    category: "Paddles",
    msrp: 299.95,
    image: `${IMG}/scorpeus.jpg`,
    moq: 1,
    presets: [...PRESETS.Paddles],
    tiers: [
      { min: 1, price: 179.97 },
      { min: 6, price: 164.97 },
      { min: 12, price: 149.98 },
      { min: 24, price: 134.98 },
    ],
  }),
  hc40: withBuyerPrice({
    id: "hc40",
    sku: "600091",
    name: "HC-40 Balls",
    fullName: "HC-40 Balls (3-Pack)",
    category: "Balls",
    msrp: 9.95,
    image: `${IMG}/hc40.jpg`,
    moq: 12,
    presets: [...PRESETS.Balls],
    tiers: [
      { min: 12, price: 6.47 },
      { min: 24, price: 5.97 },
      { min: 48, price: 5.47 },
    ],
  }),
  bag: withBuyerPrice({
    id: "bag",
    sku: "600333",
    name: "Tour Elite Bag",
    fullName: "Tour Elite Bag",
    category: "Bags",
    msrp: 109.95,
    image: `${IMG}/bag.jpg`,
    moq: 1,
    presets: [...PRESETS.Bags],
    tiers: [
      { min: 1, price: 71.47 },
      { min: 3, price: 65.97 },
      { min: 6, price: 60.47 },
    ],
  }),
};

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function moneyWhole(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function priceAt(product: JoolaProduct, qty: number): number {
  let price = product.tiers[0].price;
  for (const tier of product.tiers) {
    if (qty >= tier.min) price = tier.price;
  }
  return price;
}

export function nextTier(
  product: JoolaProduct,
  qty: number,
): Tier | null {
  for (const tier of product.tiers) {
    if (tier.min > qty) return tier;
  }
  return null;
}

export function lineAmount(product: JoolaProduct, qty: number): number {
  return Math.round(priceAt(product, qty) * qty * 100) / 100;
}

/** Credit figures used by the case-study credit meter (copy-v3 fig 6). */
export const JOOLA_CREDIT = {
  limit: 10000,
  used: 4200,
  available: 5800,
} as const;

/** Story credit used on the account / rep side ($50k line). */
export const JOOLA_ACCOUNT_CREDIT = {
  limit: 50000,
  priorUsed: 5000,
  available: 45000,
  afterOrder: 40091.34,
  terms: "Net 30",
} as const;

export const JOOLA_MESSAGES = {
  anna: "Perseus Pro V, SKU 600558. When can you restock 120 units?",
  annaTime: "10:31 AM",
  samTime: "10:42 AM",
  sam: "120 units of Perseus Pro V ship Fri, Oct 17. Invoice INV-1042 covers the restock on Net 30.",
} as const;

export const JOOLA_REP_HOLD =
  "Your rep will need to approve before it ships." as const;
