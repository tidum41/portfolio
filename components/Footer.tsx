"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CopyEmail from "@/components/CopyEmail";
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
          padding-bottom: calc(24px + env(safe-area-inset-bottom));
          min-height: 69px;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 16px;
          list-style: none;
          margin: 0;
          padding: 0;
          line-height: 21px;
        }
        .footer-links li {
          line-height: 21px;
        }
        /* Phone only. At 480px and up the row stays name-left, links-right. */
        @media (max-width: 479px) {
          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 20px;
          }
          .footer-links {
            gap: 20px;
          }
          .footer-links a {
            min-height: 0;
          }
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
        className="footer-link"
        style={{ ...linkStyle, color: "var(--color-text-muted)" }}
      >
        Mudit Mahajan
      </Link>

      <nav aria-label="Social links">
        <ul className="footer-links">
          {FOOTER_LINKS.map((item) => (
            <li key={item.label}>
              {"copyEmail" in item ? (
                <CopyEmail
                  unstyled
                  className="footer-link"
                  style={{ ...linkStyle, color: "var(--color-text-primary)" }}
                >
                  {item.label}
                </CopyEmail>
              ) : (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ ...linkStyle, color: "var(--color-text-primary)" }}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </FooterShell>
  );
}
