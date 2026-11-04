import type { Metadata } from "next";
import "./joola-b2b.css";
import ProtoChrome from "./ProtoChrome";

export const metadata: Metadata = {
  title: "JOOLA B2B — Onboarding",
  description:
    "First-run onboarding for the JOOLA wholesale buyer portal prototype.",
  robots: { index: false, follow: false },
};

export default function JoolaB2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="joola-b2b">
      <ProtoChrome />
      {children}
    </div>
  );
}
