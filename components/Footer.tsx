import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer>
      <style>{`
        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px var(--page-px);
        }
      `}</style>
      <div style={{ maxWidth: "var(--grid-max-w)", margin: "0 auto" }}>
        <div className="footer-inner">
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              lineHeight: "21px",
              color: "var(--color-text-muted)",
              textDecoration: "none",
            }}
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
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 16,
                      lineHeight: "21px",
                      color: "var(--color-text-primary)",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
