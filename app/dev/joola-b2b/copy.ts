/**
 * JOOLA B2B onboarding — all user-facing strings in one place.
 * Mudit reviews and approves copy here. Do not hardcode new UI text elsewhere.
 * Principles: design/briefs/joola-content.md
 */

export const copy = {
  brand: {
    wholesale: "Wholesale",
    accountName: "Engage Pickleball",
    buyerName: "Anna Bright",
    repName: "Collin Johns",
    repRole: "Your JOOLA sales rep",
  },

  chrome: {
    progressLabel: "Onboarding progress",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    skip: "Skip for now",
    back: "Back",
    continue: "Continue",
    saveDefaults: "Save defaults",
    finish: "Go to Quick Order",
    closeAria: "Close onboarding",
  },

  /** Screen 1 — Welcome */
  welcome: {
    title: "Order JOOLA gear for your club",
    lede: "Wholesale restock for team and club buyers — account prices, your ship-tos, and Net 30.",
    benefits: [
      {
        title: "Build an order your way",
        body: "Search by name or SKU, upload a CSV, or reuse a saved order.",
      },
      {
        title: "Defaults stick",
        body: "Set ship-to, PO, and preferred ship-by once. Cart starts with them filled in.",
      },
      {
        title: "Your rep confirms ship dates",
        body: "Collin Johns reviews each order and sets the ship date. You track it in Order history.",
      },
    ],
    cta: "Set up your account",
  },

  /** Screen 2 — Set your defaults */
  defaults: {
    title: "Set your defaults",
    lede: "These fill in on every new cart. You can change them per order.",
    shipTo: {
      label: "Ship-to address",
      helper: "Required. Pick the warehouse this account usually ships to.",
      change: "Change",
      menuLabel: "Choose ship-to address",
      emptyPrompt: "Choose a ship-to",
      emptyHint: "Select a warehouse so cart and confirmation know where to send the order.",
      errorMissing: "Choose a ship-to address before continuing.",
      tagMain: "Usual",
    },
    po: {
      label: "PO number",
      optional: "Optional",
      helper:
        "Optional for most orders. Add one if your club needs a PO on the invoice. Leave blank if you do not use POs.",
      placeholder: "e.g. ENG-9812",
      errorFormat:
        "That PO does not look right. Use letters, a hyphen, and numbers — like ENG-9812. Remove spaces.",
    },
    shipBy: {
      label: "Preferred ship-by",
      helper:
        "A request, not a promise. Collin Johns confirms the real ship date after you place the order.",
      placeholder: "Pick a date",
      errorPast: "Pick today or a later date. Past dates cannot be a ship-by request.",
    },
  },

  /** Screen 3 — Your terms */
  terms: {
    title: "Your terms",
    lede: "How payment and ship dates work on this account.",
    net30: {
      label: "Payment",
      title: "Net 30",
      body: "You have 30 days from the invoice date to pay. No card is charged at checkout.",
    },
    credit: {
      label: "Credit line",
      title: "$50,000 credit line",
      /** Approved prototype string — keep verbatim */
      meter: "$25,693.50 left of $50,000",
      body: "Available credit updates as open invoices and new orders post. Cart shows how much of this order will use.",
    },
    shipDate: {
      label: "Ship dates",
      /** Approved prototype status chip — keep verbatim */
      pendingTag: "Ship date pending",
      /** Approved prototype confirmation lede — keep verbatim when joined */
      confirmLedeBefore: "Collin Johns will confirm your ship date. Track it in ",
      confirmLedeLink: "Order history",
      confirmLedeAfter: ".",
      /** Full string for review / search — must match Before + Link + After */
      confirmLede:
        "Collin Johns will confirm your ship date. Track it in Order history.",
      body: "After you place an order, the status stays on Ship date pending until your rep sets the date. That is normal — not a hold or a problem.",
    },
  },

  /** Screen 4 — Start your first order */
  firstOrder: {
    title: "Start your first order",
    lede: "Three ways in. Pick the one that matches how you restock.",
    paths: {
      search: {
        title: "Search",
        body: "Type a product name or SKU on Quick Order, set qty, add the line.",
        cta: "Open search",
      },
      csv: {
        title: "Upload CSV",
        body: "Paste or upload a spreadsheet of SKUs and quantities. We add the matching lines.",
        /** Approved prototype control label — keep verbatim */
        cta: "Upload CSV",
      },
      saved: {
        title: "Saved orders",
        body: "Reuse a past restock. Add lines to the cart you have, or replace it.",
        cta: "Browse saved orders",
      },
    },
    empty: {
      title: "No lines in your cart yet",
      body: "When you add products, they show up here with account price and line total. Your defaults (ship-to, PO, ship-by) carry into checkout.",
      /** Approved prototype CTA pattern — keep wording style */
      exampleCta: "Add 4 lines to cart",
    },
  },

  /** Finish / handoff */
  finish: {
    title: "You are set",
    lede: "Defaults saved. Head to Quick Order to build your first cart — Collin Johns is your rep if you need anything.",
    cta: "Go to Quick Order",
  },

  /** Lightweight dashboard handoff (post-onboarding) */
  dashboard: {
    title: "Quick Order",
    lede: "Search name or SKU to add lines. Your defaults are ready in cart.",
    banner: "Defaults saved. Ready to build an order.",
    searchPlaceholder: "Search name or SKU",
    /** Approved prototype control label — keep verbatim */
    uploadCsv: "Upload CSV",
    savedOrders: "Saved orders",
    creditLeft: "$25,693.50 left of $50,000",
    placingOrder: "Placing order",
    shipDatePending: "Ship date pending",
    onboardingLink: "Replay onboarding",
  },

  shipTos: [
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
  ] as const,
} as const;

export type OnboardingCopy = typeof copy;
