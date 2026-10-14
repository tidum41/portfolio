import type { FilmConfig, EasingPreset } from "@joola-remotion/joola/film-config";
import { createTimelineState } from "@joola-remotion/joola/timeline-state";

export const STORAGE_KEY = "joola-remotion-playground-config-v1";

export const EASING_OPTIONS: { value: EasingPreset; label: string }[] = [
  { value: "camera", label: "Camera (gentle in-out)" },
  { value: "move", label: "Camera move (story pans)" },
  { value: "inOut", label: "Ease in-out (morph)" },
  { value: "ui", label: "UI state (strong ease-out)" },
  { value: "fade", label: "Fade" },
  { value: "easeOut", label: "Ease-out (pill width)" },
  { value: "pointer", label: "Pointer travel (Ramp-style)" },
  { value: "push", label: "Push" },
  { value: "settle", label: "Settle" },
];

export type BeatBlock = {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
};

export function beatBlocks(config: FilmConfig): BeatBlock[] {
  const tl = createTimelineState(config);
  const c = tl.CLICK;
  return [
    { id: "logo", label: "Logo intro", start: 0, end: tl.MORPH[1], color: "#c4b5fd" },
    { id: "search", label: "Search + results", start: tl.MORPH[1], end: c.result, color: "#93c5fd" },
    { id: "row", label: "Perseus row + qty", start: c.result, end: tl.PAN_AB[0], color: "#6ee7b7" },
    { id: "rail", label: "Reorder rail + template", start: tl.PAN_AB[0], end: tl.PAN_BC[0], color: "#fde68a" },
    { id: "add", label: "Add to cart + pill", start: tl.PAN_BC[0], end: c.pill + 20, color: "#fdba74" },
    { id: "cart", label: "Cart review", start: c.pill, end: tl.PAN_CART[1], color: "#f9a8d4" },
    { id: "place", label: "Place order + morph", start: tl.PAN_CART[1], end: tl.CONF_HOLD[1], color: "#a5b4fc" },
    { id: "outro", label: "Logo outro", start: tl.END_FADE[0], end: tl.DURATION, color: "#d1d5db" },
  ];
}

export function clickFrames(config: FilmConfig): { key: string; label: string; frame: number }[] {
  const c = config.clicks;
  return [
    { key: "search", label: "Click search", frame: c.search },
    { key: "result", label: "Select Perseus", frame: c.result },
    { key: "qty", label: "Qty preset 120", frame: c.qty },
    { key: "tpl", label: "Open template", frame: c.tpl },
    { key: "tplAdd", label: "Apply template", frame: c.tplAdd },
    { key: "add", label: "Add to cart", frame: c.add },
    { key: "pill", label: "Open cart pill", frame: c.pill },
    { key: "place", label: "Place order", frame: c.place },
  ];
}

export function describeFrame(config: FilmConfig, frame: number): string {
  const tl = createTimelineState(config);
  const f = frame;
  const sec = (n: number) => `${(n / tl.FPS).toFixed(2)}s`;

  if (f < tl.MORPH[0]) return "Hold on the loop logo before the intro glide.";
  if (f < tl.MORPH[1]) {
    const u = (f - tl.MORPH[0]) / (tl.MORPH[1] - tl.MORPH[0]);
    return `Logo glides into the sidebar slot (${Math.round(u * 100)}% of ${sec(tl.MORPH[1] - tl.MORPH[0])} morph).`;
  }
  if (f >= tl.END_FADE[0]) {
    if (f < tl.END_FADE[1]) return `UI fades out; JOOLA logo returns for ${sec(tl.END_FADE[1] - tl.END_FADE[0])}.`;
    return "End hold — same frame as loop start.";
  }

  for (const m of tl.MOVES) {
    if (f >= m.a && f <= m.b && m.b > m.a) {
      const u = (f - m.a) / (m.b - m.a);
      return `Camera eases (${m.label}) — ${Math.round(u * 100)}% over ${sec(m.b - m.a)}.`;
    }
  }

  const nearClick = clickFrames(config).find(({ frame: cf }) => Math.abs(cf - f) <= 2);
  if (nearClick) return `Cursor click: ${nearClick.label} (frame ${nearClick.frame}).`;

  if (f >= tl.TYPE_SEARCH[0] && f <= tl.TYPE_SEARCH[1]) return `Typing “Perseus” in the search field.`;
  if (f >= tl.PILL_FILL[0] && f <= tl.PILL_FILL[1]) return `Cart pill fills and badge scales in.`;
  if (f >= tl.CONF_MORPH[0] && f <= tl.CONF_MORPH[1]) return `Order summary morphs into Order placed (${sec(tl.CONF_MORPH[1] - tl.CONF_MORPH[0])}).`;
  if (f >= tl.CONF_HOLD[0] && f < tl.CONF_HOLD[1]) return `Reading hold on Order placed (${sec(tl.CONF_HOLD[1] - tl.CONF_HOLD[0])}).`;

  return "Dashboard holds still — cursor travels or UI state updates in place.";
}

/** Map report.md “Steal” bullets to tweak-panel anchors */
export const TECHNIQUE_PARAM_LINKS: Record<string, string> = {
  "centred confirmation": "param-beats-orderMorphDuration",
  "push the outgoing card forward": "param-camera-shotOrderPlaced",
  "staggered list reveal": "param-beats-rowInsertDuration",
  "long holds": "param-beats-orderPlacedHold",
  "camera only zooms toward where the cursor": "param-camera-shotB",
  "one zoom per beat": "param-beats-panAbDuration",
  "macOS arrow": "param-clickLead",
  "Travel follows": "param-cursorMovePreset",
  "dwell 6 frames": "param-clickLead",
  "press scale of 0.9": "param-clicks-add",
  "opacity 0→1 plus y 6 px": "param-beats-rowInsertDuration",
  "List stagger": "param-beats-templateRowsDuration",
  "badge appears with scale 0.6→1.0": "param-beats-pillFillDuration",
  "Credit bar": "param-beats-panCartDuration",
  "cross-fades": "param-beats-orderMorphDuration",
  "Logo card": "param-beats-logoOutDuration",
  "0.6 s minimum": "param-beats-orderPlacedHold",
  "opacity fade of 0.30 s": "param-morph",
};

export const REF_GALLERY: { source: string; images: { src: string; title: string }[] }[] = [
  {
    source: "Ramp",
    images: [
      { src: "/motion-refs/strips/ramp-procurement.png", title: "Procurement hero (closest match)" },
      { src: "/motion-refs/strips/ramp-billpay.png", title: "Bill Pay stagger + holds" },
      { src: "/motion-refs/strips/ramp-demo.png", title: "Product demo zooms" },
    ],
  },
  {
    source: "Linear",
    images: [
      { src: "/motion-refs/strips/linear-dashboards.png", title: "Dashboards calm zoom" },
      { src: "/motion-refs/strips/linear-insights-hero.png", title: "Insights hero pull-back" },
      { src: "/motion-refs/strips/linear-launch-film.png", title: "Launch film" },
      { src: "/motion-refs/strips/linear-agent.png", title: "Linear Agent" },
    ],
  },
  { source: "Notion", images: [{ src: "/motion-refs/strips/notion-hero.png", title: "Homepage hero" }, { src: "/motion-refs/strips/notion-ai.png", title: "Notion AI" }] },
  { source: "Raycast", images: [{ src: "/motion-refs/strips/raycast-focus.png", title: "Focus" }, { src: "/motion-refs/strips/raycast-new.png", title: "New Raycast" }] },
  { source: "Framer", images: [{ src: "/motion-refs/strips/framer-1.png", title: "Clip A" }, { src: "/motion-refs/strips/framer-2.png", title: "Clip B (anti-ref)" }] },
  { source: "Arc", images: [{ src: "/motion-refs/strips/arc-1.0.png", title: "Arc 1.0" }] },
];
