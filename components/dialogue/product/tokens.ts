/**
 * Dialogue product tokens — t384 live study-chat measurements are source of truth.
 *
 * Cite: `design/briefs/dialogue-ds-tokens.md` ← measurements from
 * `/home/ubuntu/.cursor/projects/workspace/uploads/measurements_6731.md`
 * (getComputedStyle dumps of research.dialogueai.com Insights summary chat).
 *
 * Do NOT commit private screenshots / raw JSON (privacy/EULA) — keep in uploads only.
 */

export const LIVE_CSS_SOURCE = {
  main: "/cursor/stores/self/dialogue-live-css/1w9mr5dy3h8y1.css",
  fonts: "/cursor/stores/self/dialogue-live-css/0foqked6n1lzo.css",
  mediaSkin: "/cursor/stores/self/dialogue-live-css/290yvv_x3nxom.css",
  rootVars: "/cursor/stores/self/dialogue-live-css/root-vars.txt",
  /** t384 computed-style table (agent uploads; not committed) */
  measurementsMd:
    "/home/ubuntu/.cursor/projects/workspace/uploads/measurements_6731.md",
} as const;

export const PAPER_SOURCE_FILES = [
  "/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt",
  "public/dev/dialogue-static/export/section-3.html",
  "public/dev/dialogue-static/export/section-6.html",
] as const;

/**
 * Literal DM Sans first so figures/clones paint the product face even when
 * `--font-dialogue-dm-sans` is out of scope (outside layout variable host).
 * next/font registers the @font-face globally from `fonts.ts` / layout.
 */
export const dialogueFontFamily = '"DM Sans", "DM Sans Fallback", system-ui, sans-serif';

/** Maps to live `--font-brand` (Zilla Slab) — wordmark uses `/dialogue/logo.svg` asset */
export const dialogueBrandFontFamily =
  '"Zilla Slab", "Zilla Slab Fallback", Georgia, serif';

/**
 * Text roles from t384 measurements (DM Sans, letter-spacing: normal).
 * Chart labels were not in the measured response — use Dialogue’s small role (12/400/16 muted).
 */
export const dialogueTextRoles = {
  /** Assistant body + user bubble text */
  assistantBody: { size: "14px", weight: "400", leading: "24px", color: "#1c1917" },
  userBubble: { size: "14px", weight: "400", leading: "24px", color: "#1c1917" },
  /** Header title ("Study chat") + in-response h2/h3 */
  header: { size: "14px", weight: "500", leading: "20px", color: "#1c1917" },
  /** Header subtitle */
  subtitle: { size: "12px", weight: "400", leading: "16px", color: "#57534d" },
  /** Beta badge type */
  badge: { size: "12px", weight: "500", leading: "16px", color: "#1c1917" },
  /** Quote card header (muted) */
  quoteHeader: { size: "14px", weight: "400", leading: "20px", color: "#57534d" },
  /** Quote card body */
  quote: { size: "14px", weight: "400", leading: "22.75px", color: "#1c1917" },
  /** Status / query pill label (monospace in product) */
  pill: { size: "14px", weight: "400", leading: "20px", color: "#57534d", mono: true },
  /** Empty-state suggestion chips */
  suggestion: { size: "14px", weight: "500", leading: "20px", color: "rgb(116,116,116)" },
  /**
   * Chart axis/bar labels — not measurable in t384 response (no chart).
   * Uses Dialogue small role: 12/400/16 muted.
   */
  chartLabel: { size: "12px", weight: "400", leading: "16px", color: "#57534d" },
  /** `strong` / bold emphasis inside Dialogue UI */
  bold: { weight: "600" },
} as const;

export const dialogueProductTokens = {
  font: {
    family: dialogueFontFamily,
    brandFamily: dialogueBrandFontFamily,
    /** Measured: `normal` everywhere (overrides prior -0.01em guess) */
    productLetterSpacing: "normal",
    /** Assistant body / user bubble — 14/400/24 */
    bodySize: "14px",
    bodyLeading: "24px",
    bodyWeight: "400",
    /** Header title / headings — 14/500/20 */
    headerSize: "14px",
    headerLeading: "20px",
    headerWeight: "500",
    /** Subtitle / chart labels / badge size — 12/400/16 */
    smallSize: "12px",
    smallLeading: "16px",
    smallWeight: "400",
    /** Quote header, pill, textarea — 14/400/20 */
    metaSize: "14px",
    metaLeading: "20px",
    metaWeight: "400",
    /** Quote body leading-relaxed */
    quoteLeading: "22.75px",
    /** Product UI bold (`strong`) — real Dialogue weight; site chrome may still cap 500 */
    boldWeight: "600",
    mediumWeight: "500",
    badgeWeight: "500",
    suggestionWeight: "500",
    clipTimeSize: "11px",
    /** @deprecated aliases kept for callers; same as body/meta */
    panelBodySize: "14px",
    panelBodyLeading: "24px",
    panelMetaSize: "14px",
    panelMetaLeading: "20px",
  },
  color: {
    ink: "#1c1917",
    muted: "#57534d",
    mutedLight: "#79716b",
    border: "#e7e5e4",
    /** Input border (gray-200) */
    inputBorder: "#e5e7eb",
    surface: "#fcfbf9",
    /** User bubble / beta badge fill */
    warm: "#f1eeea",
    /** Quote card / paper-50 */
    bg: "#f8f6f3",
    appBg: "#fafaf9",
    sidebarBg: "#f8f6f3",
    brand: "#b43f7f",
    brandIcon: "#de4f9d",
    funnelBarCart: "#d6d3d1",
    funnelBarFocal: "#b43f7f",
    funnelBarDark: "#57534d",
    funnelBarMid: "#a8a29e",
    skeleton: "#d6d3d1",
    suggestion: "rgb(116, 116, 116)",
  },
  radius: {
    /** Chat panel `rounded-3xl` */
    chatShell: "24px",
    /** User bubble */
    bubble: "16px",
    /** Quote card, status pill, input, search step */
    control: "14px",
    searchStep: "14px",
    vizCard: "14px",
    thumb: "8px",
    /** Suggestion chips / beta badge */
    chip: "8px",
    appShell: "0.75rem",
    statCard: "0.5rem",
  },
  space: {
    chatPad: "28px",
    /** Inner flex gap on chat content column */
    chatGap: "16px",
    /** Message list gap (user/assistant turns) */
    messageGap: "12px",
    vizPad: "12px",
    funnelLabelW: "110px",
    funnelPctW: "40px",
    funnelBarH: "8px",
    sidebarWidth: "252px",
    appShellWidth: "1280px",
    appShellHeight: "748px",
    paperFrameWidth: "922px",
    paperFrameHeight: "540px",
    paperSidebarWidth: "188px",
    /**
     * Live floating chat panel width (t384: 447.78px incl. border → 448).
     * All ScaledChatViewport chat figures render at this inner width then scale.
     */
    placementChatWidth: "448px",
    placementChatHeight: "658px",
    placementInset: "24px",
    placementLauncherSize: 48,
    placementLauncherGap: 12,
    userBubblePadY: "8px",
    userBubblePadX: "16px",
    statusPillPadY: "8px",
    statusPillPadX: "16px",
    suggestionPadY: "8px",
    suggestionPadX: "12px",
    inputPad: "12px",
  },
  shadow: {
    chat: "0 8px 24px -12px rgb(28 25 23 / 8%)",
    appShell: "0 1px 2px rgb(28 25 23 / 5%), 0 8px 24px rgb(28 25 23 / 5%)",
  },
  media: {
    borderRadius: "2rem",
    iconSize: "18px",
    fontSize: "0.8125rem",
    lineHeight: "1.5",
    surfaceBackground: "rgb(0 0 0 / 25%)",
    borderColor: "rgb(0 0 0 / 10%)",
  },
} as const;

export const dialogueCopy = {
  /** Live study-chat header title (t384) */
  assistantTitle: "Study chat",
  betaLabel: "Beta",
  /** Case-study study context (live product uses a generic answering subtitle) */
  studySubtitle: "Checkout usability, 24 interviews",
  composerPlaceholder: "Ask about your study...",
  searchStep: (searched: number, found: number) =>
    `Searched ${searched} interviews, found ${found} relevant moments`,
  funnelTitle: "Checkout funnel, % of participants still in flow",
  funnelLargestDrop: "Shipping address",
  funnelLargestDropPct: 38,
  studyPageTitle: "Checkout usability study, Q3",
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

export function dialogueProductCssVariables(): Record<string, string> {
  const t = dialogueProductTokens;
  return {
    "dp-font-family": t.font.family,
    "dp-font-brand": t.font.brandFamily,
    "dp-font-product-tracking": t.font.productLetterSpacing,
    "dp-bg": t.color.bg,
    "dp-surface": t.color.surface,
    "dp-app-bg": t.color.appBg,
    "dp-sidebar-bg": t.color.sidebarBg,
    "dp-card": "#ffffff",
    "dp-ink": t.color.ink,
    "dp-muted": t.color.muted,
    "dp-muted-light": t.color.mutedLight,
    "dp-border": t.color.border,
    "dp-input-border": t.color.inputBorder,
    "dp-warm": t.color.warm,
    "dp-brand": t.color.brand,
    "dp-brand-icon": t.color.brandIcon,
    "dp-funnel-track": t.color.warm,
    "dp-funnel-bar": t.color.funnelBarMid,
    "dp-funnel-bar-cart": t.color.funnelBarCart,
    "dp-funnel-bar-focal": t.color.funnelBarFocal,
    "dp-funnel-bar-dark": t.color.funnelBarDark,
    "dp-skeleton": t.color.skeleton,
    "dp-suggestion": t.color.suggestion,
    "dp-sidebar-width": t.space.sidebarWidth,
    "dp-app-shell-width": t.space.appShellWidth,
    "dp-app-shell-height": t.space.appShellHeight,
    "dp-paper-frame-width": t.space.paperFrameWidth,
    "dp-paper-frame-height": t.space.paperFrameHeight,
    "dp-paper-sidebar-width": t.space.paperSidebarWidth,
    "dp-placement-chat-width": t.space.placementChatWidth,
    "dp-placement-chat-height": t.space.placementChatHeight,
    "dp-chat-pad": t.space.chatPad,
    "dp-chat-gap": t.space.chatGap,
    "dp-radius": t.radius.chatShell,
    "dp-radius-bubble": t.radius.bubble,
    "dp-radius-control": t.radius.control,
    "dp-radius-chip": t.radius.chip,
    "text-body-size": t.font.bodySize,
    "text-body-leading": t.font.bodyLeading,
    "text-header-size": t.font.headerSize,
    "text-header-leading": t.font.headerLeading,
    "text-small-size": t.font.smallSize,
    "text-small-leading": t.font.smallLeading,
    "text-meta-size": t.font.metaSize,
    "text-meta-leading": t.font.metaLeading,
    "text-quote-leading": t.font.quoteLeading,
    "text-chart-size": t.font.smallSize,
    "text-chart-leading": t.font.smallLeading,
    "dp-weight-bold": t.font.boldWeight,
    "dp-weight-medium": t.font.mediumWeight,
    "shadow-chat": t.shadow.chat,
    "shadow-app": t.shadow.appShell,
    "dp-media-radius": t.media.borderRadius,
    "dp-media-font-size": t.media.fontSize,
  };
}
