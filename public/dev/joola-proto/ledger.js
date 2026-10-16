/**
 * Single source of truth for the JOOLA B2B wholesale prototype.
 * Every screen reads this ledger. Story: Anna Bright at Engage Pickleball
 * builds a multi-line restock on Net 30; hero line is Perseus Pro V × 120.
 */
(function (root) {
  "use strict";

  function money(n) {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function priceAt(product, qty) {
    var tiers = product.tiers;
    var price = tiers[0].price;
    for (var i = 0; i < tiers.length; i++) {
      if (qty >= tiers[i].min) price = tiers[i].price;
    }
    return price;
  }

  function nextTier(product, qty) {
    for (var i = 0; i < product.tiers.length; i++) {
      if (product.tiers[i].min > qty) return product.tiers[i];
    }
    return null;
  }

  /** Qty presets ≤3, category-aware (paddles case packs, ball cases, bag packs). */
  var PRESETS = {
    Paddles: [6, 12, 24],
    Balls: [12, 48, 100],
    Bags: [1, 3, 6],
  };

  var products = {
    perseus: {
      id: "perseus",
      sku: "600558",
      name: "Perseus Pro V",
      fullName: "Perseus Pro V",
      category: "Paddles",
      msrp: 299.95,
      image: "products/perseus.jpg",
      moq: 1,
      presets: PRESETS.Paddles,
      tiers: [
        { min: 1, price: 179.97 },
        { min: 6, price: 164.97 },
        { min: 12, price: 149.98 },
        { min: 24, price: 134.98 },
      ],
    },
    hyperion: {
      id: "hyperion",
      sku: "300829",
      name: "Hyperion Pro IV",
      fullName: "Hyperion Pro IV 14mm",
      category: "Paddles",
      msrp: 229.95,
      image: "products/hyperion.jpg",
      moq: 1,
      presets: PRESETS.Paddles,
      tiers: [
        { min: 1, price: 137.97 },
        { min: 6, price: 126.47 },
        { min: 12, price: 114.98 },
        { min: 24, price: 103.48 },
      ],
    },
    scorpeus: {
      id: "scorpeus",
      sku: "600567",
      name: "Scorpeus Pro V",
      fullName: "Scorpeus Pro V",
      category: "Paddles",
      msrp: 299.95,
      image: "products/scorpeus.jpg",
      moq: 1,
      presets: PRESETS.Paddles,
      tiers: [
        { min: 1, price: 179.97 },
        { min: 6, price: 164.97 },
        { min: 12, price: 149.98 },
        { min: 24, price: 134.98 },
      ],
    },
    hc40: {
      id: "hc40",
      sku: "600091",
      name: "HC-40 Balls",
      fullName: "HC-40 Balls (3-Pack)",
      category: "Balls",
      msrp: 9.95,
      image: "products/hc40.jpg",
      moq: 12,
      presets: PRESETS.Balls,
      tiers: [
        { min: 12, price: 6.47 },
        { min: 24, price: 5.97 },
        { min: 48, price: 5.47 },
      ],
    },
    bag: {
      id: "bag",
      sku: "600333",
      name: "Tour Elite Bag",
      fullName: "Tour Elite Bag",
      category: "Bags",
      msrp: 109.95,
      image: "products/bag.jpg",
      moq: 1,
      presets: PRESETS.Bags,
      tiers: [
        { min: 1, price: 71.47 },
        { min: 3, price: 65.97 },
        { min: 6, price: 60.47 },
      ],
    },
  };

  /** One browse/buyer unit price per SKU (best unlocked tier). Catalog + search use this. */
  Object.keys(products).forEach(function (id) {
    var p = products[id];
    p.buyerPrice = p.tiers[p.tiers.length - 1].price;
  });

  /**
   * Story order on Quick Order / Cart / INV-1042 / Messages:
   * Multi-line restock led by Perseus Pro V × 120 at $134.98.
   * Related SKUs from the same catalog keep the table full and realistic.
   */
  var orderLines = [
    { productId: "perseus", qty: 120 },
    { productId: "hyperion", qty: 24 },
    { productId: "hc40", qty: 48 },
    { productId: "bag", qty: 6 },
  ];

  function lineAmount(line) {
    var p = products[line.productId];
    return Math.round(priceAt(p, line.qty) * line.qty * 100) / 100;
  }

  var orderTotal =
    Math.round(
      orderLines.reduce(function (sum, line) {
        return sum + lineAmount(line);
      }, 0) * 100
    ) / 100;

  var perseusLine = orderLines.find(function (l) {
    return l.productId === "perseus";
  });
  var perseusUnit = priceAt(products.perseus, perseusLine.qty);
  var perseusOrderTotal =
    Math.round(perseusUnit * perseusLine.qty * 100) / 100;

  var shipDate = "Fri, Oct 17";
  /** JOOLA sales order number (NetSuite SO tranid). Buyer PO is separate. */
  var orderId = "SO-48213";
  /** Maps to NetSuite otherRefNum; optional at checkout (blank until entered). */
  var customerPo = "";
  /** Sales order status in NetSuite Advanced Shipping flow. */
  var orderStatus = "Pending Fulfillment";

  var shipTos = [
    {
      id: "engage-main",
      name: "Engage Pickleball",
      site: "Main warehouse",
      detail: "1847 Industrial Blvd, Austin TX",
    },
    {
      id: "engage-north",
      name: "Engage Pickleball",
      site: "North warehouse",
      detail: "2200 Research Park, Round Rock TX",
    },
  ];
  var shipToId = "engage-main";

  /** Quiet line availability (location / stock) - not a warehouse picker. */
  var lineFulfillment = {
    perseus: { warehouse: "CA", availability: "In stock" },
    hyperion: { warehouse: "CA", availability: "In stock" },
    scorpeus: { warehouse: "TX", availability: "In stock" },
    hc40: { warehouse: "CA", availability: "Ships in 2 days" },
    bag: { warehouse: "TX", availability: "In stock" },
  };

  /**
   * INV-1042 is the open invoice for this Quick Order (full cart on Net 30).
   * Messages quote the same total. Supporting open invoices fill the credit bar.
   */
  var invoices = [
    {
      id: "INV-1042",
      order: orderId,
      issued: "Oct 3, 2026",
      due: "Nov 2, 2026",
      amount: orderTotal,
      status: "Processing",
      open: true,
    },
    {
      id: "INV-1039",
      order: "PO-118",
      issued: "Sep 18, 2026",
      due: "Oct 18, 2026",
      amount: 3800.0,
      status: "Due",
      open: true,
    },
    {
      id: "INV-1021",
      order: "PO-110",
      issued: "Aug 12, 2026",
      due: "Sep 11, 2026",
      amount: 1200.0,
      status: "Overdue",
      open: true,
    },
    {
      id: "INV-1014",
      order: "PO-104",
      issued: "Jul 28, 2026",
      due: "Aug 27, 2026",
      amount: 8400.0,
      status: "Paid",
      open: false,
    },
  ];

  /**
   * Round credit seed: limit $50,000 · open balance (ex-this-order) $5,000 ·
   * available before place $45,000 · after this order $25,693.50.
   * INV-1039 ($3,800) + INV-1021 ($1,200) = $5,000 prior used.
   * INV-1042 books this restock, so available after place = limit − open.
   */
  var creditLimit = 50000;
  var creditPriorUsed = 5000;
  var creditUsed =
    Math.round(
      invoices
        .filter(function (inv) {
          return inv.open;
        })
        .reduce(function (s, inv) {
          return s + inv.amount;
        }, 0) * 100
    ) / 100;
  /** Sanity: open invoices must equal priorUsed + this order. */
  if (Math.abs(creditUsed - (creditPriorUsed + orderTotal)) > 0.009) {
    creditUsed = Math.round((creditPriorUsed + orderTotal) * 100) / 100;
  }
  var creditAvailable = Math.round((creditLimit - creditUsed) * 100) / 100;
  var creditAfterOrder = creditAvailable;
  var creditPriorAvailable = Math.round((creditLimit - creditPriorUsed) * 100) / 100;

  var messages = {
    anna: "Perseus Pro V, SKU 600558. When can you restock 120 units?",
    annaTime: "10:31 AM",
    samTime: "10:42 AM",
    sam:
      "120 units of Perseus Pro V ship " +
      shipDate +
      ". Invoice INV-1042 for " +
      money(orderTotal) +
      " covers the full restock on Net 30.",
  };

  var recommendedMeta = {
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
      detail: "Engage on-hand estimate: 3 units",
    },
    hc40: {
      reason: "Pairs with paddles",
      detail: "Ordered with Perseus 5 of 6 times",
    },
  };

  /**
   * Last 3 restocks for reorder rail + size warning.
   * PO-118 total matches INV-1039. Average is high enough that the hero
   * cart (~$19.3k) is under 3× and does not trip the anomalous-size notice.
   */
  var recentOrders = [
    {
      id: "PO-118",
      label: "Match week restock",
      when: "Sep 18",
      total: 3800.0,
      lines: 3,
    },
    {
      id: "PO-104",
      label: "Back-to-school",
      when: "Jul 28",
      total: 8400.0,
      lines: 4,
    },
    {
      id: "PO-098",
      label: "Club pack",
      when: "Jun 20",
      total: 9200.0,
      lines: 5,
    },
  ];
  var recentAvg =
    Math.round(
      (recentOrders.reduce(function (s, o) {
        return s + o.total;
      }, 0) /
        recentOrders.length) *
        100
    ) / 100;

  /** Saved templates carry their own line items so the Templates screen can expand them. */
  function tplLines(lines) {
    return lines.map(function (l) {
      return { productId: l.productId, qty: l.qty, amount: lineAmount(l) };
    });
  }
  function tplTotal(lines) {
    return Math.round(lines.reduce(function (s, l) { return s + l.amount; }, 0) * 100) / 100;
  }
  var tplPerseusLines = tplLines([{ productId: "perseus", qty: perseusLine.qty }]);
  var tplMatchLines = tplLines([
    { productId: "hyperion", qty: 24 },
    { productId: "hc40", qty: 48 },
    { productId: "bag", qty: 6 },
  ]);
  var templates = [
    {
      id: "tpl-perseus",
      name: "Perseus restock",
      savedBy: "Ben Johns",
      updated: "Sep 30",
      lines: tplPerseusLines,
      total: tplTotal(tplPerseusLines),
      detail: perseusLine.qty + " units, " + money(perseusOrderTotal),
    },
    {
      id: "tpl-match",
      name: "Match kit",
      savedBy: "Federico Staksrud",
      updated: "Aug 14",
      lines: tplMatchLines,
      total: tplTotal(tplMatchLines),
      detail: "3 lines, " + money(tplTotal(tplMatchLines)),
    },
  ];

  /** JOOLA-side people. Names are JOOLA-sponsored pros used as stand-ins. */
  var rep = { name: "Collin Johns", role: "Your JOOLA sales rep" };
  var threads = [
    {
      id: "restock",
      name: rep.name,
      role: "Sales rep",
      preview: "Perseus Pro V restock",
      time: "10:42 AM",
      active: true,
    },
    {
      id: "ar",
      name: "Simone Jardim",
      role: "Accounts receivable",
      preview: "INV-1021 is past due",
      time: "Mon",
    },
    {
      id: "warranty",
      name: "Tyson McGuffin",
      role: "Warranty",
      preview: "Return approved for 2 paddles",
      time: "Oct 2",
    },
  ];

  var ledger = {
    retailer: {
      name: "Engage Pickleball",
      buyer: "Anna Bright",
      role: "Buyer",
      logo: "engage-logo.png",
      avatar: "engage-logo.png",
      avatarSize: 28,
    },
    storeUrl: "https://joola.com",
    searchQuery: "Perseus",
    terms: "Net 30",
    products: products,
    recommended: ["perseus", "hyperion", "scorpeus", "hc40"],
    recommendedMeta: recommendedMeta,
    catalogExtra: ["bag"],
    orderLines: orderLines,
    orderId: orderId,
    customerPo: customerPo,
    shipDate: shipDate,
    shipTos: shipTos,
    shipToId: shipToId,
    lineFulfillment: lineFulfillment,
    orderStatus: orderStatus,
    orderTotal: orderTotal,
    /** Pill amount mirrors the open order; badge starts at 0 until Add all. */
    cartTotal: orderTotal,
    cartCount: 0,
    cartCountAfterAdd: orderLines.length,
    perseusUnit: perseusUnit,
    perseusQty: perseusLine.qty,
    perseusOrderTotal: perseusOrderTotal,
    invoices: invoices,
    credit: {
      limit: creditLimit,
      used: creditUsed,
      priorUsed: creditPriorUsed,
      thisOrder: orderTotal,
      /** Available before placing this order. */
      priorAvailable: creditPriorAvailable,
      available: creditAvailable,
      afterOrder: creditAfterOrder,
      pct: Math.round((creditUsed / creditLimit) * 1000) / 10,
      priorPct: Math.round((creditPriorUsed / creditLimit) * 1000) / 10,
      orderPct: Math.round((orderTotal / creditLimit) * 1000) / 10,
    },
    messages: messages,
    recentOrders: recentOrders,
    recentAvg: recentAvg,
    templates: templates,
    rep: rep,
    threads: threads,
    money: money,
    priceAt: priceAt,
    nextTier: nextTier,
    lineAmount: lineAmount,
    figures: (function () {
      var amounts = [
        0,
        perseusUnit,
        perseusOrderTotal,
        orderTotal,
        creditUsed,
        creditLimit,
        creditAvailable,
        creditPriorUsed,
        creditPriorAvailable,
        creditAfterOrder,
      ];
      orderLines.forEach(function (line) {
        amounts.push(lineAmount(line));
        amounts.push(priceAt(products[line.productId], line.qty));
      });
      invoices.forEach(function (inv) {
        amounts.push(inv.amount);
      });
      recentOrders.forEach(function (o) {
        amounts.push(o.total);
      });
      Object.keys(products).forEach(function (id) {
        var p = products[id];
        amounts.push(p.msrp);
        p.tiers.forEach(function (t) {
          amounts.push(t.price);
        });
      });
      var unique = [];
      amounts.forEach(function (n) {
        var r = Math.round(n * 100) / 100;
        if (unique.indexOf(r) === -1) unique.push(r);
      });
      return {
        perseusUnit: perseusUnit,
        perseusQty: perseusLine.qty,
        perseusOrderTotal: perseusOrderTotal,
        orderTotal: orderTotal,
        cartTotal: orderTotal,
        creditUsed: creditUsed,
        creditLimit: creditLimit,
        creditAvailable: creditAvailable,
        invoiceAmounts: invoices.map(function (inv) {
          return inv.amount;
        }),
        lineAmounts: orderLines.map(lineAmount),
        unitPrices: orderLines.map(function (line) {
          return priceAt(products[line.productId], line.qty);
        }),
        lineCount: orderLines.length,
        allowedMoney: unique,
        allowedQtys: [perseusLine.qty]
          .concat(
            orderLines.map(function (l) {
              return l.qty;
            }),
            [12, 24, 60, 120, 1, 3, 6, 48]
          )
          .filter(function (v, i, a) {
            return a.indexOf(v) === i;
          }),
      };
    })(),
  };

  root.JOOLA_LEDGER = ledger;
})(typeof window !== "undefined" ? window : globalThis);
