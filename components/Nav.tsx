"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/",           label: "home" },
  { href: "/playground", label: "playground" },
  { href: "/about",      label: "about" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header style={{ background: "transparent", position: "relative", zIndex: 40 }}>
      <div style={{ maxWidth: "var(--grid-max-w)", margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <nav
          className="flex items-center justify-end"
          style={{ gap: 40, paddingTop: 24, paddingBottom: 24 }}
          aria-label="Main navigation"
        >
          <ThemeToggle />
          {links.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                aria-current={isActive ? "page" : undefined}
                className="nav-link"
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: "24px",
                  color: isActive ? "var(--color-text-muted)" : "var(--color-text-primary)",
                  textDecoration: "none",
                  transition: "color 0.25s ease",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
