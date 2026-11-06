import posthog from "posthog-js";

// Public project token + managed reverse proxy. Env vars override these so
// local/preview can point elsewhere without a redeploy of the defaults.
// Never use https://www.muditm.com here — that once took the site down when
// the proxy was mistakenly attached to the apex/www hostname.
const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  "phc_ohcmQCHibbSJzE7NYL6zVdxRj2MWQovThVWdUque36Vi";

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://e.muditm.com";

posthog.init(POSTHOG_KEY, {
  api_host: POSTHOG_HOST,
  ui_host: "https://us.posthog.com",
  defaults: "2026-05-30",
  person_profiles: "identified_only",
});
