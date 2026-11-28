import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DepthFigures from "./DepthFigures";

export const metadata: Metadata = { title: "Dialogue depth, annotated figures", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Dev only, never imported on /dialogue. ?fig=when|clicks|four shows one figure. */
export default async function Page({ searchParams }: { searchParams: Promise<{ fig?: string }> }) {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  const { fig } = await searchParams;
  return <DepthFigures only={fig} />;
}
