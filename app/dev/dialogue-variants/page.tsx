import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VariantsLab from "./VariantsLab";
import { BEATS, type Beat } from "./beats";

export const metadata: Metadata = { title: "Dialogue answer variants", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** ?beat=ask|reply|count|source|asks sets the compare's first beat; ?menu=open opens option 4's menu (for stills). */
export default async function DialogueVariantsPage({ searchParams }: { searchParams: Promise<{ beat?: string; menu?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { beat, menu } = await searchParams;
  const b = BEATS.find((x) => x.id === beat)?.id as Beat | undefined;
  return <VariantsLab beat={b} menuOpen={menu === "open"} />;
}
