import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContinuedLab, { type Opt, type Phase } from "./ContinuedLab";
import { HYBRID_CASES, HYBRID_STATES, isHybrid, type HybridCase, type HybridState } from "./hybridModel";

export const metadata: Metadata = { title: "Dialogue continued interaction", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OPTS = ["a", "b", "c", "cs"] as const;
const PHASES = ["start", "landed", "next"] as const;

/** ?opt=a|b|c|cs isolates one take; ?state=start|landed|next freezes the beat (for stills and the walkthrough).
 *  ?opt=h|h1|h2 isolates the hybrid or an alternative; ?state=start|open|typed|landed|reset|top freezes its state.
 *  &case=cleared|override (with reset) and &case=other|tie|reply1 (with top) freeze the spec's variants. */
export default async function DialogueContinuedPage({ searchParams }: { searchParams: Promise<{ opt?: string; state?: string; case?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { opt, state, case: caseParam } = await searchParams;
  const o = isHybrid(opt) ? opt : OPTS.includes(opt as Opt) ? (opt as Opt) : undefined;
  const ph = PHASES.includes(state as Phase) ? (state as Phase) : "landed";
  const hs = HYBRID_STATES.includes(state as HybridState) ? (state as HybridState) : "landed";
  const variant = HYBRID_CASES.includes(caseParam as HybridCase) ? (caseParam as HybridCase) : undefined;
  return <ContinuedLab key={`${o ?? "all"}:${ph}:${hs}:${variant ?? ""}`} opt={o} phase={ph} hybridState={hs} variant={variant} />;
}
