"use client";

import dynamic from "next/dynamic";
import type { CaseStudyData } from "@/lib/sanity/queries";

const JoolaCaseStudyContent = dynamic(() => import("./JoolaCaseStudyContent"), {
  ssr: false,
  loading: () => <p className="cs-body">Loading case study…</p>,
});

export default function JoolaCaseStudyClient({ cs }: { cs: CaseStudyData }) {
  return <JoolaCaseStudyContent cs={cs} />;
}
