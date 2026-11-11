export type JoolaProtoApp = "round5" | "qo";

export function joolaProtoHashUrl(
  app: JoolaProtoApp,
  pathname: string,
  params: Record<string, string>,
): string {
  const search = new URLSearchParams({ embed: "1", ...params });
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/joola-proto/${app}/index.html#${path}?${search.toString()}`;
}

export const JOOLA_FIGURE_URLS = {
  "quick-order-portal": joolaProtoHashUrl("round5", "/quick-order", {
    clean: "1",
    view: "portal",
    screen: "quick-order",
    state: "default",
    latency: "0",
    account: "dicks",
  }),
  "review-checkout": joolaProtoHashUrl("round5", "/review", {
    clean: "1",
    view: "portal",
    screen: "review",
    state: "default",
    latency: "0",
    account: "dicks",
  }),
} as const;

export type QoVariant = "1" | "2" | "3" | "4" | "5";

export function qoRowUrl(v: QoVariant): string {
  return joolaProtoHashUrl("qo", "/prototypes/quick-order-row", {
    clean: "1",
    v,
    line: "typed",
    w: "1024",
    latency: "0",
  });
}

export type ApprovalVariant = "1" | "3";

export function approvalUrl(v: ApprovalVariant): string {
  return joolaProtoHashUrl("round5", "/prototypes/approval-queue", {
    clean: "1",
    v,
    protoState: "default",
    latency: "0",
  });
}

/** Native layout heights at design width (measured from static embed; updated after build). */
/** Hero: QO presets row playground (5 lines, pack chips). */
export function qoHeroPresetsUrl(): string {
  return joolaProtoHashUrl("qo", "/prototypes/quick-order-row", {
    clean: "1",
    v: "5",
    line: "typed",
    w: "1280",
    latency: "0",
  });
}

export const JOOLA_EMBED_HEIGHT: Record<string, number> = {
  "quick-order-hero": 720,
  "quick-order-portal": 1000,
  "quick-order-row-search": 900,
  /** Max across Cases / Reorder / Stock variants (no layout jump on toggle). */
  "quick-order-row-compare": 1035,
  "review-checkout": 560,
  "approval-queue-split": 824,
  "approval-queue-ledger": 896,
};
