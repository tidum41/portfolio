import type { ComponentType } from "react";
import {
  RecStage,
  ProductPageStage,
  IdentityStage,
  MotionStage,
  QuickOrderStage,
  MessagesStage,
} from "@/components/joola/cycles/CycleStages";

export type CycleVerdict = "kept" | "dropped";

export type CycleStageProps = { v: number; replayKey?: number };

export type CycleRound = {
  v: number;
  changed: string;
  verdict: CycleVerdict;
  note: string;
};

export type CycleDecision = {
  slug: string;
  title: string;
  motion: boolean;
  Stage: ComponentType<CycleStageProps>;
  rounds: CycleRound[];
};

export const JOOLA_CYCLES: CycleDecision[] = [
  {
    slug: "recommended",
    title: "Recommended",
    motion: false,
    Stage: RecStage,
    rounds: [
      { v: 5, changed: "Catalog gets a Recommended For You rail of best-seller, new and reorder-often items, placed above the chips", verdict: "kept", note: "A short list, not the whole catalog." },
      { v: 8, changed: "Chips move under the heading. Recommended gets its own gray band. Grid cards drop their category label, and Recommended cards keep theirs", verdict: "kept", note: "Browsing comes first. The rail reads as an aside." },
      { v: 9, changed: "Stock states. In stock shows nothing, low stock shows \"Only 8 left\", out of stock grays the card and offers \"Notify me when back in stock\"", verdict: "kept", note: "The common case gets no badge." },
      { v: 10, changed: "A show/hide toggle. Badges vary. \"Only 8 left\" becomes \"Low stock\" on the MOQ line", verdict: "kept", note: "One repeated \"#1 Best Seller\" said nothing. Every card is the same height now." },
      { v: 11, changed: "The toggle moves onto the heading line, and the description is cut to one line", verdict: "kept", note: "The switch sits next to what it controls." },
      { v: 12, changed: "Off hides the description too, and the label reads \"Showing\" or \"Hidden\"", verdict: "kept", note: "Before this, turning it off left the copy up, and it looked broken." },
      { v: 15, changed: "Short chips. Reason lines are gone. Real products replace the apparel. \"Added\" gets a stroke check", verdict: "kept", note: "Fewer words on the photo." },
      { v: 16, changed: "The rail is three real paddles, with the subtitle \"The three paddles this restock needs.\" Chips become \"Ordered most\", \"Your history\" and \"Also due\"", verdict: "kept", note: "The rail matches the restock in the film." },
      { v: 18, changed: "The subtitle becomes \"Based on your orders.\" The chips are removed", verdict: "dropped", note: "I brought the chips back next round." },
      { v: 19, changed: "Chips return, actually round this time, at a 2px radius inside the 10px photo", verdict: "kept", note: "The 2px class didn't exist in the stylesheet, so they'd been square." },
      { v: 20, changed: "Cards follow the joola.com stack (photo, title, price), with no category line", verdict: "kept", note: "The same category three times read as shouting." },
    ],
  },
  {
    slug: "product-page",
    title: "Product page",
    motion: false,
    Stage: ProductPageStage,
    rounds: [
      { v: 1, changed: "The first build includes a wholesale Product Detail page for tier pricing", verdict: "dropped", note: "I retired it in v14." },
      { v: 5, changed: "The PDP's breadcrumb moves under the shared wholesale bar instead of replacing it", verdict: "kept", note: "Same nav on every screen." },
      { v: 6, changed: "The unit price goes from 24 to 30px", verdict: "kept", note: "The price is the loudest thing in the buy box." },
      { v: 14, changed: "Retired. The tab is disabled at 30% and moved to the end, and the markup stays in the file", verdict: "kept", note: "It explained tiered pricing this fixed-price distributor doesn't have." },
    ],
  },
  {
    slug: "identity",
    title: "Identity",
    motion: false,
    Stage: IdentityStage,
    rounds: [
      { v: 2, changed: "The real JOOLA logo, font and tokens. The account becomes \"Pickleball Central\"", verdict: "kept", note: "Everything else depends on the real brand." },
      { v: 5, changed: "One shared wholesale bar on every screen", verdict: "kept", note: "It kept changing shape between screens." },
      { v: 6, changed: "The person logged in shows small under the org", verdict: "kept", note: "The org stays first." },
      { v: 7, changed: "The cart badge hugs the icon, and the running total sits next to the bag", verdict: "kept", note: "You see the cost before opening the cart." },
      { v: 10, changed: "Placeholder names become pickleball players (\"Anna W.\", \"Riley N.\")", verdict: "dropped", note: "v13 swapped them for full names of JOOLA's own athletes." },
      { v: 11, changed: "A unified account pill, a black Cart pill, a \"Wholesale\" tag by the logo, and \"Switch to Retail Store\". The DTC bag icon is gone", verdict: "kept", note: "One cart in a B2B view." },
      { v: 12, changed: "The tag is removed and the switch is icon-only. The bag icon returns to the Cart pill", verdict: "dropped", note: "The tag repeated the wholesale bar and collided with the switch." },
      { v: 13, changed: "The Cart pill is icon-only. The switch is removed. Names are JOOLA-sponsored athletes (Anna Bright, Lea Jansen)", verdict: "kept", note: "A mockup can't fake the DTC to B2B account logic, so I wrote it up as unsolved." },
      { v: 20, changed: "The \"PC\" monogram is replaced by \"Pickleball Central\" set as the mark", verdict: "dropped", note: "The monogram wasn't their logo, and their real one vanished on the light chip." },
      { v: 21, changed: "The retailer is Holabird Sports with its logo. The active nav item is an underline", verdict: "dropped", note: "Holabird didn't read as pickleball." },
      { v: 22, changed: "The retailer is Engage Pickleball. The account chip is the earlier pill (logo, name, Anna Bright · Buyer, chevron)", verdict: "kept", note: "A black wordmark that says pickleball." },
    ],
  },
  {
    slug: "motion",
    title: "Motion",
    motion: true,
    Stage: MotionStage,
    rounds: [
      { v: 5, changed: "Order History reuses the Templates expand and collapse", verdict: "kept", note: "No new component." },
      { v: 7, changed: "Instant open, about 180 ms close, rows fade and lift with a 15 ms stagger", verdict: "dropped", note: "Only the rows animated, and the space didn't close." },
      { v: 8, changed: "The height animates to 0 with the rows, 90 to 130 ms, ease-out", verdict: "dropped", note: "Still choppy." },
      { v: 9, changed: "No animation. Open and close are instant", verdict: "kept", note: "I stopped tuning motion that wasn't working." },
      { v: 10, changed: "The plus/x icon goes from 150 ms linear to 120 ms, cubic-bezier(0.34, 1.56, 0.64, 1)", verdict: "kept", note: "It snaps now instead of rotating." },
    ],
  },
  {
    slug: "quick-order",
    title: "Quick order",
    motion: false,
    Stage: QuickOrderStage,
    rounds: [
      { v: 3, changed: "Quantities become real inputs with live tier repricing and an MOQ error. A fake \"2 results in 0.4ms\" line is removed", verdict: "kept", note: "The math is real, so the bugs were findable." },
      { v: 4, changed: "Rows group by category with small labels. Tier hints go two-tone", verdict: "kept", note: "You can check \"did I order enough balls\" at a glance." },
      { v: 6, changed: "The footer total goes from 24 to 38px, and line totals to 17px", verdict: "kept", note: "The total is the answer the buyer is checking." },
      { v: 9, changed: "Low and out-of-stock rows. Out of stock gets a disabled quantity and a \"—\" total", verdict: "kept", note: "Stock should change what you can order." },
      { v: 12, changed: "Every total is computed from the real rows, and the header pill too", verdict: "kept", note: "One source of truth fixed a real cart bug." },
      { v: 15, changed: "A black \"Search SKU\" button before Bulk upload, with the example SKU 600558", verdict: "dropped", note: "The field could do the job alone." },
      { v: 16, changed: "The button is gone, and the field is the search, with \"search by name, category, sku\"", verdict: "kept", note: "No second button. The lowercase list still read like a tag." },
      { v: 17, changed: "The placeholder becomes \"Search by name, category, or SKU,\" on mobile too", verdict: "kept", note: "It reads as an instruction." },
      { v: 19, changed: "The field is 420×46. Save as template and Add All To Cart become the same 46px control. The line count is computed from the rows", verdict: "kept", note: "The count had said 50 lines when there were 13." },
      { v: 20, changed: "Bulk upload matches the field (46px, 10px radius, 1px #DEDEDE)", verdict: "kept", note: "The field stays the primary control." },
    ],
  },
  {
    slug: "messages",
    title: "Messages",
    motion: true,
    Stage: MessagesStage,
    rounds: [
      { v: 15, changed: "Messages is a real screen. Anna Bright asks about 120 Perseus Pro V, Sam Ortiz says Friday, and a line says any JOOLA rep can pick it up", verdict: "kept", note: "The thread already shows any rep can answer." },
      { v: 16, changed: "A single column. The line and the page heading go. The header is the JOOLA wordmark plus \"JOOLA Sales\", and Send is an arrow in a 20px circle", verdict: "dropped", note: "I took the wordmark out in v18." },
      { v: 18, changed: "The title becomes \"Message sales\", the wordmark goes, and the thread is only as tall as its two messages", verdict: "kept", note: "At that size the wordmark read as a black sticker." },
      { v: 19, changed: "The same wholesale bar as the other screens, and Send is a 36px circle with a 16px arrow", verdict: "kept", note: "It should feel like the same portal." },
      { v: 21, changed: "The header says JOOLA Sales, roles show (Buyer, JOOLA Sales), and Anna's bubble gets a small Sent check", verdict: "kept", note: "Both sides of the conversation are clear." },
    ],
  },
];

export function findDecision(slug: string | null | undefined): CycleDecision {
  return JOOLA_CYCLES.find((d) => d.slug === slug) ?? JOOLA_CYCLES[0];
}

export function findRound(decision: CycleDecision, v: number | null | undefined): CycleRound {
  if (v == null || Number.isNaN(v)) return decision.rounds[0];
  return decision.rounds.find((r) => r.v === v) ?? decision.rounds[0];
}
