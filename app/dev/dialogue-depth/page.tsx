import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import DepthLab from "./DepthLab";

export const metadata: Metadata = {
  title: "Dialogue depth explorations",
  robots: { index: false, follow: false },
};

// The gate is evaluated per request, not baked in at build time, so a
// production deployment 404s even though the route exists in the bundle
// (the same gate as app/dev/dialogue-canvas). check:dialogue-depth fails without it.
export const dynamic = "force-dynamic";

export default function DialogueDepthPage() {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  ) {
    notFound();
  }
  return (
    <Suspense fallback={null}>
      <DepthLab />
    </Suspense>
  );
}
