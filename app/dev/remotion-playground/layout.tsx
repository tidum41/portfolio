import type { Metadata } from "next";
import PlaygroundChrome from "./PlaygroundChrome";

export const metadata: Metadata = {
  title: "JOOLA film playground",
  robots: { index: false, follow: false },
};

export default function RemotionPlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <PlaygroundChrome>{children}</PlaygroundChrome>;
}
