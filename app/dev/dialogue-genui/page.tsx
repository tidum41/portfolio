import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import GenUiLab from "./GenUiLab";

export const metadata: Metadata = {
  title: "Dialogue gen-UI rules playground",
  robots: { index: false, follow: false },
};

// Same per-request gate as app/dev/dialogue-depth: a production deployment 404s.
export const dynamic = "force-dynamic";

export default function DialogueGenUiPage() {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    notFound();
  }
  return (
    <Suspense fallback={null}>
      <GenUiLab />
    </Suspense>
  );
}
