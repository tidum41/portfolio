import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      fontFamily: "var(--font-sans)",
      padding: "0 var(--page-px)",
    }}>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 12px", letterSpacing: "0.04em" }}>404</p>
      <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: "0 0 32px" }}>this page doesn&rsquo;t exist.</p>
      <Link href="/" style={{ fontSize: 14, color: "var(--color-text-secondary)", textDecoration: "underline" }}>
        back to work
      </Link>
    </div>
  );
}
