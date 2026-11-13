import { notFound } from "next/navigation";
import JoolaParityBench from "@/components/joola/JoolaParityBench";
import { joolaPreviewModeActive } from "@/lib/sanity/caseStudyDraft";

const ALLOWED = new Set([
  "quick-order-portal",
  "quick-order-row-search",
  "quick-order-row-compare",
  "review-checkout",
  "approval-queue",
]);

export default async function JoolaParityPage({
  searchParams,
}: {
  searchParams: Promise<{ figure?: string; variant?: string; tab?: string; sanity_preview?: string }>;
}) {
  const params = await searchParams;
  if (!(await joolaPreviewModeActive(params.sanity_preview))) notFound();
  const figure = params.figure;
  if (!figure || !ALLOWED.has(figure)) notFound();
  return (
    <main style={{ padding: 0, margin: 0, background: "#fff" }}>
      <JoolaParityBench figure={figure} variant={params.variant} tab={params.tab} />
    </main>
  );
}
