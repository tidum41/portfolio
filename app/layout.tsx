import type { Metadata } from "next";
import "./globals.css";
import "dialkit/styles.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import GlobalCustomCursor from "@/components/GlobalCustomCursor";
import AnimationProvider from "@/components/AnimationProvider";
import DevToolbar from "@/components/DevToolbar";
import { PersistentWorkShell } from "@/components/PersistentWorkShell";
import { getDesignSystem, designSystemToCss, getProjects } from "@/lib/sanity/queries";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Mudit Mahajan",
    "product design",
    "UCLA",
    "portfolio",
    "UI UX",
    "frontend",
  ],
  authors: [{ name: "Mudit Mahajan", url: SITE_URL }],
  creator: "Mudit Mahajan",
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [ds, projects] = await Promise.all([getDesignSystem(), getProjects()]);
  const dsStyle = designSystemToCss(ds);

  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Flash prevention: apply saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")})()` }} />
        {/* Intro gate: hide non-hero elements immediately on home page load/reload.
            Runs before React hydration so there's zero flash. IntroOrchestrator
            detects this attribute and fires the 1.2s timer to reveal everything. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){if(location.pathname==="/")document.documentElement.setAttribute("data-intro","playing")})()` }} />
        <style dangerouslySetInnerHTML={{ __html: dsStyle }} />
        {/* Hide system cursor immediately on pointer:fine devices — before JS
            hydration — so there's no flash of the default arrow on load. */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine){*{cursor:none!important}}` }} />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <JsonLd />
      </head>
      <body style={{ fontFamily: "var(--font-sans)", background: "var(--color-bg)" }}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GlobalCustomCursor />
        <Nav />
        <main id="main-content">
          {/* Mounted once, unconditionally, for the whole session — never
              unmounted by route changes. See PersistentWorkShell for why. */}
          <PersistentWorkShell projects={projects} />
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
