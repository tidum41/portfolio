/**
 * Dialogue case-study copy and layout constants. Colors, type and radii live
 * in styles/dialogue-tokens.css only (see design/RULES.md).
 */

/** Live floating chat panel width (447.78px incl. border, rounded to 448). */
export const PLACEMENT_CHAT_WIDTH = 448;

export const dialogueCopy = {
  /** Live study-chat header title (t384). Round O: the real panel header
      reads "Chat" with the Beta pill, per the product screens. */
  assistantTitle: "Chat",
  betaLabel: "Beta",
  /** Case-study study context (live product uses a generic answering subtitle) */
  studySubtitle: "Checkout usability, 24 interviews",
  composerPlaceholder: "Ask about your study...",
  searchStep: (searched: number, found: number) =>
    `Searched ${searched} interviews, found ${found} relevant moments`,
  funnelTitle: "Checkout funnel, % of participants still in flow",
  funnelLargestDrop: "Shipping address",
  studyPageTitle: "Checkout usability study",
  nav: {
    insightsSummary: "Insights summary",
    researchPlan: "Research plan",
    sections: "Sections",
    participants: "Participants",
  },
  tabs: {
    insights: "Insights",
    participants: "Participants",
    sections: "Sections",
  },
  statTiles: {
    completion: "Completion rate",
    address: "Address friction",
    payment: "Payment trust",
  },
  keyInsights: "Key insights",
  mixedSentiment: "Mixed sentiment",
} as const;
