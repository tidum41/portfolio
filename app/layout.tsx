import type { Metadata } from "next";
import "./globals.css";
import "dialkit/styles.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GlobalCustomCursor from "@/components/GlobalCustomCursor";
import AnimationProvider from "@/components/AnimationProvider";
import DevToolbar from "@/components/DevToolbar";
import { getDesignSystem, designSystemToCss } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: {
    default: "Mudit Mahajan — Product Design",
    template: "%s — Mudit Mahajan",
  },
  description:
    "Portfolio of Mudit Mahajan — product design student at UCLA, designing for the communities I'm obsessed with.",
  openGraph: {
    title: "Mudit Mahajan — Product Design",
    description: "Portfolio of Mudit Mahajan — product design student at UCLA.",
    type: "website",
    siteName: "Mudit Mahajan",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ds = await getDesignSystem();
  const dsStyle = designSystemToCss(ds);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Flash prevention: apply saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")})()` }} />
        <style dangerouslySetInnerHTML={{ __html: dsStyle }} />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "var(--font-sans)", background: "var(--color-bg)" }}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GlobalCustomCursor />
        <Nav />
        <main id="main-content">
          <AnimationProvider>
            {children}
          </AnimationProvider>
        </main>
        <Footer />
        {process.env.NODE_ENV === "development" && <DevToolbar />}
      </body>
    </html>
  );
}
