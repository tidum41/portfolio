/**
 * Dialogue product tokens — copied from Paper / static export source of truth.
 * Primary: `public/dev/dialogue-static/_next/static/css/fde99ba4c3e111ce.css`
 * Markup: `public/dev/dialogue-static/export/section-3.html`, `section-6.html`
 * Paper upload: `/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt`
 */

export const PAPER_SOURCE_FILES = [
  "/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt",
  "/cursor/stores/bot/dialogue-sources/paper/player-controls-paper-5SR-0.tsx.txt",
  "/cursor/stores/bot/dialogue-sources/paper/player-dialog-paper-597-0.txt",
  "public/dev/dialogue-static/_next/static/css/fde99ba4c3e111ce.css",
  "public/dev/dialogue-static/export/section-3.html",
  "public/dev/dialogue-static/export/section-6.html",
  "public/dev/dialogue-static/export/storyboard/answer.html",
  "public/dev/dialogue-static/export/visual-6.html",
] as const;

export const dialogueFontFamily =
  'var(--font-dialogue-dm-sans, "DM Sans"), system-ui, -apple-system, sans-serif';

/** Root tokens on `:root` / `body` in static export CSS */
export const dialogueProductTokens = {
  font: {
    family: dialogueFontFamily,
    bodySize: "14px",
    bodyLeading: "20px",
    metaSize: "12px",
    metaLeading: "16px",
    panelBodySize: "14px",
    panelBodyLeading: "20px",
    panelMetaSize: "12px",
    panelMetaLeading: "16px",
  },
  color: {
    ink: "#1c1917",
    muted: "#57534d",
    mutedLight: "#78716c",
    border: "#e7e5e4",
    surface: "#fcfbf9",
    warm: "#f1eeea",
    bg: "#f8f6f3",
    appBg: "#fafaf9",
    sidebarBg: "#f5f5f4",
    brand: "#b43f7f",
    brandIcon: "#b03a78",
    funnelBarCart: "#d6d3d1",
    funnelBarFocal: "#b43f7f",
    funnelBarDark: "#57534d",
    funnelBarMid: "#a8a29e",
    skeleton: "#d6d3d1",
  },
  radius: {
    chatShell: "24px",
    bubble: "16px",
    searchStep: "14px",
    vizCard: "10px",
    thumb: "8px",
    chip: "8px",
    appShell: "12px",
    statCard: "8px",
  },
  space: {
    chatPad: "28px",
    vizPad: "12px",
    funnelLabelW: "72px",
    funnelPctW: "40px",
    funnelBarH: "8px",
  },
  shadow: {
    chat: "0 8px 24px -12px rgb(28 25 23 / 8%)",
    appShell: "0 1px 2px rgb(28 25 23 / 5%), 0 8px 24px rgb(28 25 23 / 5%)",
  },
} as const;

export const dialogueCopy = {
  assistantTitle: "Research assistant",
  studySubtitle: "Checkout usability, 24 interviews",
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
  wordmark: "dialogue",
} as const;

export function dialogueProductCssVariables(): Record<string, string> {
  const t = dialogueProductTokens;
  return {
    "dp-font-family": t.font.family,
    "dp-bg": t.color.bg,
    "dp-surface": t.color.surface,
    "dp-app-bg": t.color.appBg,
    "dp-sidebar-bg": t.color.sidebarBg,
    "dp-card": "#ffffff",
    "dp-ink": t.color.ink,
    "dp-muted": t.color.muted,
    "dp-muted-light": t.color.mutedLight,
    "dp-border": t.color.border,
    "dp-warm": t.color.warm,
    "dp-brand": t.color.brand,
    "dp-brand-icon": t.color.brandIcon,
    "dp-funnel-track": t.color.warm,
    "dp-funnel-bar": t.color.funnelBarMid,
    "dp-funnel-bar-cart": t.color.funnelBarCart,
    "dp-funnel-bar-focal": t.color.funnelBarFocal,
    "dp-funnel-bar-dark": t.color.funnelBarDark,
    "dp-skeleton": t.color.skeleton,
    "text-body-size": t.font.bodySize,
    "text-body-leading": t.font.bodyLeading,
    "text-meta-size": t.font.metaSize,
    "text-meta-leading": t.font.metaLeading,
    "shadow-chat": t.shadow.chat,
    "shadow-app": t.shadow.appShell,
  };
}
