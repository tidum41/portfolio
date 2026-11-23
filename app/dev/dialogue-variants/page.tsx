import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VariantsLab from "./VariantsLab";

export const metadata: Metadata = { title: "Dialogue answer variants", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function DialogueVariantsPage() {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production") notFound();
  return <VariantsLab />;
}
