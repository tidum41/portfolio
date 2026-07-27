"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FOOTER_LINKS } from "@/lib/site";

const isDev = process.env.NODE_ENV === "development";

const linkStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: 16,
  lineHeight: "21px",
  textDecoration: "none" as const,
};

function FooterShell({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="intro-hide">
      <style>{`
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px var(--page-px);
          min-height: 69px;
        }
      `}</style>
      <div style={{ maxWidth: "var(--grid-max-w)", margin: "0 auto" }}>
        <div className="footer-inner">{children}</div>
      </div>
    </footer>
  );
}

export default function Footer() {
  // Cursor IDE's browser preview injects data-cursor-ref onto SSR'd links
  // before React hydrates — defer link rendering in dev so server/client DOM
  // match. Production keeps full SSR for SEO/crawlers.
  const [mounted, setMounted] = useState(!isDev);

  useEffect(() => {
    if (isDev) setMounted(true);
  }, []);

  if (!mounted) {
    return <FooterShell />;
  }

  return (
    <FooterShell>
      <Link
        href="/"
        style={{ ...linkStyle, color: "var(--color-text-muted)" }}
      >
        Mudit Mahajan
      </Link>

      <nav aria-label="Social links">
        <ul style={{ display: "flex", alignItems: "center", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
          {FOOTER_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                style={{ ...linkStyle, color: "var(--color-text-primary)" }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </FooterShell>
  );
}
