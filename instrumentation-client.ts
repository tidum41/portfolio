// Unset in local/dev — a static top-level import would still ship and parse
// the full posthog-js bundle on every route even with no key to init with.
// Dynamic-importing only when a real key is present avoids that download
// entirely, not just the wasted init() call.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(key, { api_host: host, defaults: "2026-05-30" });
  });
}
