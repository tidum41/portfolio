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
  icons: {
    icon: [
      // Dark glyph for light OS/browser chrome, light glyph for dark chrome
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ds = await getDesignSystem();
  const dsStyle = designSystemToCss(ds);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Runs synchronously before first paint:
            1. Applies saved light/dark theme from localStorage.
            2. Clears sessionStorage so cursor-color, wave-color, PS3 mode, etc.
               reset on every hard load (they persist only across client-side navigations).
            3. On the homepage, sets data-intro-pending so the inline <style> below
               hides nav/footer/below-hero until HomeIntroGate lifts the gate. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname==="/")document.documentElement.setAttribute("data-intro-pending","");})()` }} />
        {/* Intro gate — inline so it is guaranteed to apply in the same paint as the
            script above, with no stylesheet-load race. Hides the nav, footer, and the
            below-hero wrapper (project grid + PS3 pill) until data-intro-pending is
            removed. The transition rule must sit on the element itself so it fires the
            instant the attribute disappears. */}
        <style dangerouslySetInnerHTML={{ __html: `html[data-intro-pending]>body>header,html[data-intro-pending]>body>footer,html[data-intro-pending] .below-hero{opacity:0!important;pointer-events:none!important}body>header,body>footer,.below-hero{transition-property:opacity;transition-duration:500ms;transition-timing-function:cubic-bezier(.16,1,.3,1)}` }} />
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
