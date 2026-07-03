"use server";

import { createClient } from "@sanity/client";
import type { DesignSystemData } from "@/lib/sanity/queries";

const client = createClient({
  projectId: "9vl5qk61",
  dataset: "production",
  apiVersion: "2026-06-28",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function requireToken() {
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("No SANITY_WRITE_TOKEN in .env.local");
}

// Patch a subset of fields on a case study document
export async function patchCaseStudy(slug: string, fields: Record<string, unknown>) {
  requireToken();
  await client.patch(`case-study-${slug}`).set(fields).commit();
}

// Patch (or create) the singleton design system document
export async function patchDesignSystem(fields: Partial<DesignSystemData>) {
  requireToken();
  await client
    .transaction()
    .createIfNotExists({ _id: "design-system-global", _type: "designSystem", title: "Global Design System" })
    .patch("design-system-global", (p) => p.set(fields as Record<string, unknown>))
    .commit();
}
