import type { Metadata } from "next";
import HapticsDemoClient from "./HapticsDemoClient";

export const metadata: Metadata = {
  title: "Haptics demo",
  robots: { index: false, follow: false },
};

export default function HapticsDemoPage() {
  return <HapticsDemoClient />;
}
