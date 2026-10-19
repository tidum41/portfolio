import type { Metadata } from "next";
import { dialogueMono, dialogueSans } from "./dialogue-fonts";

export const metadata: Metadata = {
  title: "Dialogue AI — Paper frames",
  robots: { index: false, follow: false },
};

export default function DialogueDevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dialogueSans.variable} ${dialogueMono.variable}`}
      style={{ fontFamily: "var(--font-dialogue-sans), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
