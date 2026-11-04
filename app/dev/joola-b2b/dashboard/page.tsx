import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "JOOLA B2B — Quick Order",
  description: "Wholesale Quick Order handoff after onboarding.",
};

export default function JoolaB2BDashboardPage() {
  return <DashboardClient />;
}
