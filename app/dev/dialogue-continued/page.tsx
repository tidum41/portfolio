import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContinuedLab, { type Opt, type Pal, type Phase, type Sim } from "./ContinuedLab";
import { HYBRID_CASES, HYBRID_STATES, isHybrid, type HybridCase, type HybridState } from "./hybridModel";

export const metadata: Metadata = { title: "Dialogue continued interaction", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const OPTS = ["a", "b", "c", "cs"] as const;
const PHASES = ["start", "landed", "next"] as const;
const PALS = ["1", "2", "3"] as const;
const SIMS = ["gray", "deutan", "protan"] as const;

/** ?opt=a|b|c|cs isolates one take; ?state=start|landed|next freezes the beat (for stills and the walkthrough).
 *  ?opt=h|h1|h2 isolates the hybrid or an alternative; ?state=start|open|typed|landed|reset|top freezes its state.
 *  &case=cleared|override (with reset) and &case=other|tie|reply1 (with top) freeze the spec's variants.
 *  ?pal=1|2|3 swaps chart fills only. &check=1 adds the palette check sheet. &sim=gray|deutan|protan filters the panels. ?frame=1|2 shows a decision frame. */
export default async function DialogueContinuedPage({ searchParams }: { searchParams: Promise<{ opt?: string; state?: string; case?: string; pal?: string; check?: string; sim?: string; frame?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { opt, state, case: caseParam, pal, check, sim, frame } = await searchParams;
  const o = isHybrid(opt) ? opt : OPTS.includes(opt as Opt) ? (opt as Opt) : undefined;
  const ph = PHASES.includes(state as Phase) ? (state as Phase) : "landed";
  const hs = HYBRID_STATES.includes(state as HybridState) ? (state as HybridState) : "landed";
  const variant = HYBRID_CASES.includes(caseParam as HybridCase) ? (caseParam as HybridCase) : undefined;
  const p = PALS.includes(pal as Pal) ? (pal as Pal) : undefined;
  const sm = SIMS.includes(sim as Sim) ? (sim as Sim) : undefined;
  const fr = frame === "1" || frame === "2" ? frame : undefined;
  const key = [o ?? "all", ph, hs, variant ?? "", p ?? "", check === "1", sm ?? "", fr ?? ""].join(":");
  return <ContinuedLab key={key} opt={o} phase={ph} hybridState={hs} variant={variant} pal={p} check={check === "1"} sim={sm} frame={fr} />;
}
