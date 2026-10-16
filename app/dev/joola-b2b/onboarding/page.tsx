import type { Metadata } from "next";
import OnboardingFlow from "./OnboardingFlow";

export const metadata: Metadata = {
  title: "JOOLA B2B — Get started",
  description:
    "Set defaults, review Net 30 terms, and start your first wholesale order.",
};

export default function JoolaB2BOnboardingPage() {
  return <OnboardingFlow />;
}
