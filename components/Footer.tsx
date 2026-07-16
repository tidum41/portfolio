import Link from "next/link";

const links = [
  { label: "linkedin", href: "https://www.linkedin.com/in/muditmahajan14/" },
  { label: "x",        href: "https://x.com/muditm14" },
  { label: "email",    href: "mailto:mudit14.mahajan@gmail.com" },
  { label: "resume",   href: "https://drive.google.com/file/d/1i4Phseyq472yu9PTt1V5-Q0-mV6HCl9y/view?usp=sharing" },
];

export default function Footer() {
  return (
    <footer className="intro-hide">
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
              {links.map(({ label, href }) => (
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
