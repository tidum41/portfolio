import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StackStress from "./StackStress";

export const metadata: Metadata = { title: "Stacked bar labels, 2 to 5 segments", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** ?only=2|3|4|5 shows one case. */
export default async function Page({ searchParams }: { searchParams: Promise<{ only?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { only } = await searchParams;
  return <StackStress only={only ? Number(only) : undefined} />;
}
