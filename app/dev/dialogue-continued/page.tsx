import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContinuedLab, { type Opt, type Phase } from "./ContinuedLab";

export const metadata: Metadata = { title: "Dialogue continued interaction", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OPTS = ["a", "b", "c"] as const;
const PHASES = ["landed", "next"] as const;

/** ?opt=a|b|c isolates one take; ?state=landed|next freezes the beat (for stills). */
export default async function DialogueContinuedPage({ searchParams }: { searchParams: Promise<{ opt?: string; state?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { opt, state } = await searchParams;
  const o = OPTS.includes(opt as Opt) ? (opt as Opt) : undefined;
  const ph = PHASES.includes(state as Phase) ? (state as Phase) : "landed";
  return <ContinuedLab key={`${o ?? "all"}:${ph}`} opt={o} phase={ph} />;
}
