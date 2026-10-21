/**
 * Dialogue product design tokens — measured from shipped case-study reference PNGs
 * (`public/dialogue/section-*.png`, fcc87a2) and Paper export (`dialogue-paper-frames-oct18.txt`).
 */

export type TokenSource = {
  /** Repo path or store path to the reference frame */
  file: string;
  note?: string;
};

export const DIALOGUE_DS_REFERENCE_ASSETS: TokenSource[] = [
  { file: "public/dialogue/section-1.png", note: "Problem / unstructured answer" },
  { file: "public/dialogue/section-2.png", note: "Chart-type gallery (static)" },
  { file: "public/dialogue/section-3.png", note: "Structured answer + funnel + clips + chips (D-08)" },
  { file: "public/dialogue/section-4.png", note: "Chart-to-clips flow" },
  { file: "public/dialogue/section-5.png", note: "Clip player + transcript (D-10)" },
  { file: "public/dialogue/section-6.png", note: "Study page + floating assistant (D-14)" },
  { file: "public/dialogue/section-6a.png", note: "Empty assistant" },
  { file: "public/dialogue/section-6b.png", note: "Docked sidebar variant" },
  { file: "public/dialogue/section-7.png", note: "Full answer drawer (D-15)" },
  { file: "public/dialogue/review/blobs/fcc87a2--section-3.png", note: "Manifest final blob (same as section-3)" },
  { file: "/cursor/stores/bot/dialogue-sources/paper/dialogue-paper-frames-oct18.txt", note: "Paper DM Sans type scale" },
  { file: "public/dev/dialogue-static/index.html", note: "Dialogue static export (--font-dm-sans)" },
];

/** DM Sans is the Dialogue product UI face (Paper + static export). Google Fonts — not a licensed desktop file. */
export const dialogueFontFamily =
  'var(--font-dialogue-dm-sans, "DM Sans"), system-ui, -apple-system, sans-serif';

export const dialogueFontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

export const dialogueColors = {
  /** section-3/6 canvas */
  bg: { value: "#F8F6F3", source: "public/dialogue/section-3.png" },
  surface: { value: "#FCFBF9", source: "dialogue-paper-frames-oct18.txt" },
  card: { value: "#FFFFFF", source: "public/dialogue/section-3.png" },
  ink: { value: "#1C1917", source: "dialogue-paper-frames-oct18.txt" },
  muted: { value: "#57534D", source: "dialogue-paper-frames-oct18.txt" },
  mutedLight: { value: "#78716C", source: "public/dialogue/section-5.png (timestamps)" },
  border: { value: "#E7E5E4", source: "dialogue-paper-frames-oct18.txt" },
  warmBubble: { value: "#F0EDEA", source: "public/dialogue/section-3.png (user bubble)" },
  searchStepBg: { value: "#FCFBF9", source: "public/dialogue/section-3.png" },
  brand: { value: "#BE185D", source: "public/dialogue/section-3.png (focal bar + logo)" },
  brandSoft: { value: "#FCE7F3", source: "derived from brand chip wash" },
  funnelTrack: { value: "#F1EEEA", source: "public/dialogue/section-3.png" },
  funnelBar: { value: "#A8A29E", source: "public/dialogue/section-3.png (non-focal bars)" },
  clipCardBg: { value: "#FDFCFD", source: "public/dialogue/section-3.png (clip rows)" },
  navActiveBg: { value: "#F5F5F4", source: "public/dialogue/section-6.png" },
  statTileBg: { value: "#F8F6F3", source: "public/dialogue/section-6.png" },
} as const;

export const dialogueRadii = {
  card: { value: "16px", source: "public/dialogue/section-3.png (assistant shell)" },
  control: { value: "12px", source: "public/dialogue/section-3.png (inner blocks)" },
  sm: { value: "10px", source: "dialogue-paper-frames-oct18.txt (study stat cards)" },
  chip: { value: "999px", source: "public/dialogue/section-3.png" },
  bubble: { value: "12px", source: "public/dialogue/section-3.png" },
} as const;

export const dialogueTypography = {
  chatTitle: { size: "15px", lineHeight: "20px", weight: 500, source: "public/dialogue/section-3.png" },
  chatSub: { size: "14px", lineHeight: "20px", weight: 400, source: "public/dialogue/section-3.png" },
  body: { size: "14px", lineHeight: "20px", weight: 400, source: "dialogue-paper-frames-oct18.txt" },
  summary: { size: "16px", lineHeight: "22px", weight: 400, source: "public/dialogue/section-3.png" },
  summaryEmphasis: { size: "16px", lineHeight: "22px", weight: 500, source: "public/dialogue/section-3.png" },
  meta: { size: "12px", lineHeight: "16px", weight: 400, source: "dialogue-paper-frames-oct18.txt" },
  metaMedium: { size: "12px", lineHeight: "16px", weight: 500, source: "public/dialogue/section-5.png" },
  chartLabel: { size: "12px", lineHeight: "16px", weight: 400, source: "public/dialogue/section-3.png" },
  chip: { size: "14px", lineHeight: "20px", weight: 400, source: "public/dialogue/section-3.png" },
  studyNav: { size: "12px", lineHeight: "16px", weight: 400, source: "public/dialogue/section-6.png" },
  studyTitle: { size: "14px", lineHeight: "20px", weight: 500, source: "public/dialogue/section-6.png" },
  studyStat: { size: "12px", lineHeight: "16px", weight: 400, source: "public/dialogue/section-6.png" },
} as const;

export const dialogueSpacing = {
  chatHeadPadding: "16px 16px 12px",
  chatBodyPadding: "16px",
  chatBodyGap: "12px",
  bubblePadding: "10px 14px",
  searchStepPadding: "10px 12px",
  chipPadding: "6px 12px",
  clipCardPadding: "8px 10px 8px 12px",
  studyPagePadding: "10px",
  studyNavPadding: "10px 8px",
  studyMainPadding: "10px",
} as const;

export const dialogueShadows = {
  chatShell: "0 1px 2px rgb(28 25 23 / 6%), 0 8px 24px rgb(28 25 23 / 6%)",
  launcher: "0 4px 16px rgb(190 24 93 / 35%)",
} as const;

/** Canonical UI strings from reference frames (sentence case). */
export const dialogueCopy = {
  assistantTitle: "Research assistant",
  studySubtitle: "Checkout usability, 24 interviews",
  searchStep: (searched: number, found: number) =>
    `Searched ${searched} interviews, found ${found} relevant moments`,
  funnelTitle: "Checkout funnel, % of participants still in flow",
  funnelLargestDrop: "Largest drop: Shipping address (−38%)",
  funnelFootnote: (n: number) => `Based on ${n} of ${n} interviews`,
  studyPageTitle: "Checkout usability study, Q3",
  nav: {
    insightsSummary: "Insights summary",
    researchPlan: "Research plan",
    sections: "Sections",
    participants: "Participants",
  },
  statTiles: {
    completion: "Completion rate",
    address: "Address friction",
    payment: "Payment trust",
  },
} as const;

/** CSS custom properties for `.dialogue-product-root` — keep in sync with `tokens.css`. */
export function dialogueProductCssVariables(): Record<string, string> {
  return {
    "dp-font-family": dialogueFontFamily,
    "dp-bg": dialogueColors.bg.value,
    "dp-surface": dialogueColors.surface.value,
    "dp-card": dialogueColors.card.value,
    "dp-ink": dialogueColors.ink.value,
    "dp-muted": dialogueColors.muted.value,
    "dp-muted-light": dialogueColors.mutedLight.value,
    "dp-border": dialogueColors.border.value,
    "dp-warm": dialogueColors.warmBubble.value,
    "dp-search-bg": dialogueColors.searchStepBg.value,
    "dp-brand": dialogueColors.brand.value,
    "dp-brand-soft": dialogueColors.brandSoft.value,
    "dp-funnel-track": dialogueColors.funnelTrack.value,
    "dp-funnel-bar": dialogueColors.funnelBar.value,
    "dp-clip-card-bg": dialogueColors.clipCardBg.value,
    "dp-nav-active-bg": dialogueColors.navActiveBg.value,
    "dp-stat-tile-bg": dialogueColors.statTileBg.value,
    "dp-radius": dialogueRadii.card.value,
    "dp-radius-sm": dialogueRadii.control.value,
    "dp-radius-xs": dialogueRadii.sm.value,
    "text-body-size": dialogueTypography.body.size,
    "text-body-leading": dialogueTypography.body.lineHeight,
    "text-summary-size": dialogueTypography.summary.size,
    "text-summary-leading": dialogueTypography.summary.lineHeight,
    "text-meta-size": dialogueTypography.meta.size,
    "text-meta-leading": dialogueTypography.meta.lineHeight,
    "text-chart-size": dialogueTypography.chartLabel.size,
    "text-chart-leading": dialogueTypography.chartLabel.lineHeight,
    "shadow-chat": dialogueShadows.chatShell,
    "shadow-launcher": dialogueShadows.launcher,
  };
}
