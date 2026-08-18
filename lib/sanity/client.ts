import { createClient } from "@sanity/client";

// Published portfolio reads — CDN for edge-cached documents. Write / draft
// clients (app/dev/actions.ts, seed scripts) keep useCdn: false + token.
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "9vl5qk61",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-06-28",
  useCdn: true,
});
