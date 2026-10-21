/**
 * Dialogue product tokens — values from live production CSS (highest precedence).
 * Source archive (agent store only): `/cursor/stores/self/dialogue-live-css/`
 *   - `1w9mr5dy3h8y1.css` — Tailwind `:root` `--color-*`, `--paper-*`, `--cherry-*`, `--font-*`, `--radius-*`
 *   - `0foqked6n1lzo.css` — `@font-face` (not copied into repo)
 *   - `290yvv_x3nxom.css` — `.media-default-skin` player tokens
 * Fallback references: Paper static export + `public/dev/dialogue-static/…`
 */

export const LIVE_CSS_SOURCE = {
  main: "/cursor/stores/self/dialogue-live-css/1w9mr5dy3h8y1.css",
  fonts: "/cursor/stores/self/dialogue-live-css/0foqked6n1lzo.css",
  mediaSkin: "/cursor/stores/self/dialogue-live-css/290yvv_x3nxom.css",
  rootVars: "/cursor/stores/self/dialogue-live-css/root-vars.txt",
} as const;

export const PAPER_SOURCE_FILES = [
  "/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt",
  "public/dev/dialogue-static/export/section-3.html",
  "public/dev/dialogue-static/export/section-6.html",
] as const;

/** Maps to live `--font-product` / `--font-sans` */
export const dialogueFontFamily =
  'var(--font-dialogue-dm-sans, var(--font-sans, "DM Sans")), system-ui, sans-serif';

/** Maps to live `--font-brand` (Zilla Slab) — wordmark uses `/dialogue/logo.svg` asset */
export const dialogueBrandFontFamily =
  'var(--font-dialogue-zilla, var(--font-brand, "Zilla Slab")), Georgia, serif';

export const dialogueProductTokens = {
  font: {
    /** `--font-sans` / `--font-product` */
    family: dialogueFontFamily,
    /** `--font-brand` */
    brandFamily: dialogueBrandFontFamily,
    /** `--font-product-letter-spacing` */
    productLetterSpacing: "-0.01em",
    /** `--text-base` */
    bodySize: "1rem",
    /** `--text-base--line-height` → 1.5 */
    bodyLeading: "1.5",
    /** `--text-sm` */
    metaSize: "0.875rem",
    /** `--text-sm--line-height` */
    metaLeading: "1.25",
    /** Chat panel (export + live): 16px / 24px body, 14px / 20px meta */
    panelBodySize: "16px",
    panelBodyLeading: "24px",
    panelMetaSize: "14px",
    panelMetaLeading: "20px",
    clipTimeSize: "11px",
  },
  color: {
    /** `--color-stone-900` / `--foreground` */
    ink: "#1c1917",
    /** `--color-stone-600` / `--muted-foreground` */
    muted: "#57534d",
    /** `--color-stone-500` */
    mutedLight: "#79716b",
    /** `--border` → `--color-stone-200` */
    border: "#e7e5e4",
    /** `--card` → `--paper-10` */
    surface: "#fcfbf9",
    /** `--secondary` / `--paper-100` */
    warm: "#f1eeea",
    /** `--background` → `--paper-50` */
    bg: "#f8f6f3",
    /** `--color-stone-50` */
    appBg: "#fafaf9",
    /** `--sidebar` → `--paper-50` (live study sidebar surface) */
    sidebarBg: "#f8f6f3",
    /** `--color-cherry` → `--cherry-800` */
    brand: "#b43f7f",
    /** `--color-cherry-700` */
    brandIcon: "#de4f9d",
    /** `--color-stone-300` */
    funnelBarCart: "#d6d3d1",
    funnelBarFocal: "#b43f7f",
    /** `--color-stone-600` */
    funnelBarDark: "#57534d",
    /** `--color-stone-400` */
    funnelBarMid: "#a8a29e",
    skeleton: "#d6d3d1",
  },
  radius: {
    /** `--radius-3xl` */
    chatShell: "1.5rem",
    /** `--radius-2xl` */
    bubble: "1rem",
    searchStep: "14px",
    /** `--radius` (0.625rem) used on viz cards; export uses 10px rounded */
    vizCard: "10px",
    thumb: "8px",
    /** `--radius-lg` → `--radius` */
    chip: "0.625rem",
    appShell: "0.75rem",
    statCard: "0.5rem",
  },
  space: {
    chatPad: "28px",
    vizPad: "12px",
    funnelLabelW: "72px",
    funnelPctW: "40px",
    funnelBarH: "8px",
    /** Live study sidebar (~252px in production study layout) */
    sidebarWidth: "252px",
    /** Production study app shell (CSS px) */
    appShellWidth: "1280px",
    appShellHeight: "748px",
  },
  shadow: {
    chat: "0 8px 24px -12px rgb(28 25 23 / 8%)",
    appShell: "0 1px 2px rgb(28 25 23 / 5%), 0 8px 24px rgb(28 25 23 / 5%)",
  },
  media: {
    /** `290yvv_x3nxom.css` `.media-default-skin` */
    borderRadius: "2rem",
    iconSize: "18px",
    fontSize: "0.8125rem",
    lineHeight: "1.5",
    surfaceBackground: "rgb(0 0 0 / 25%)",
    borderColor: "rgb(0 0 0 / 10%)",
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
    "dp-warm": t.color.warm,
    "dp-brand": t.color.brand,
    "dp-brand-icon": t.color.brandIcon,
    "dp-funnel-track": t.color.warm,
    "dp-funnel-bar": t.color.funnelBarMid,
    "dp-funnel-bar-cart": t.color.funnelBarCart,
    "dp-funnel-bar-focal": t.color.funnelBarFocal,
    "dp-funnel-bar-dark": t.color.funnelBarDark,
    "dp-skeleton": t.color.skeleton,
    "dp-sidebar-width": t.space.sidebarWidth,
    "dp-app-shell-width": t.space.appShellWidth,
    "dp-app-shell-height": t.space.appShellHeight,
    "text-body-size": t.font.bodySize,
    "text-body-leading": t.font.bodyLeading,
    "text-meta-size": t.font.metaSize,
    "text-meta-leading": t.font.metaLeading,
    "shadow-chat": t.shadow.chat,
    "shadow-app": t.shadow.appShell,
    "dp-media-radius": t.media.borderRadius,
    "dp-media-font-size": t.media.fontSize,
  };
}
