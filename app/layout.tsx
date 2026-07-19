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
import { getDesignSystem, designSystemToCss, getProjects, DS_DEFAULTS, type DesignSystemData, type SanityProject } from "@/lib/sanity/queries";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Analytics } from '@vercel/analytics/next';

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
  // A Sanity outage/misconfig must not take the whole site down — every route
  // renders through this layout, so a bare await here is a single point of
  // failure. Fall back to the shipped defaults and an empty project list,
  // matching the .catch() pattern already used for case-study fetches
  // (app/sviz/page.tsx).
  const [ds, projects] = await Promise.all([getDesignSystem(), getProjects()]).catch(
    () => [DS_DEFAULTS, []] as [Required<DesignSystemData>, SanityProject[]]
  );
  const dsStyle = designSystemToCss(ds);

  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      // Unconditionally "playing" in the static, server-rendered HTML — not
      // set by a client script checking location.pathname. This is a fixed
      // JSX attribute (same value on every route, computed at build time,
      // not per-request), so it doesn't opt any route out of static
      // rendering/ISR the way reading the request pathname via headers()
      // in this shared layout would. The homepage's intro-hidden state is
      // therefore baked directly into the HTML bytes the server sends —
      // zero JS execution required to establish it, so it can't silently
      // fail to gate. The inline script below does the inverse: on any
      // OTHER route, it removes the attribute so Nav/Footer (which also
      // render there) aren't stuck hidden. If that removal script were to
      // ever fail, the failure mode is nav/footer briefly not reappearing
      // on a non-homepage route — much lower-stakes than the previous
      // failure mode, where the whole homepage intro sequence could fail
      // wide open with no gating at all.
      data-intro="playing"
      suppressHydrationWarning
    >
      <head>
        {/* Runs synchronously before first paint:
            1. Applies saved light/dark theme from localStorage.
            2. Clears sessionStorage so cursor-color, wave-color, PS3 mode, etc.
               reset on every hard load (they persist only across client-side navigations).
            3. Off the homepage, removes data-intro="playing" (see the comment on <html>
               above for why it starts present on every route instead of being added here). */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");try{sessionStorage.clear();}catch(e){}if(location.pathname!=="/")document.documentElement.removeAttribute("data-intro")})()` }} />
        {/* Intro gate CSS — must be inline, not in globals.css. The blocking script
            above sets data-intro="playing" synchronously, but globals.css is an
            external stylesheet that loads separately over the network. On production
            there is a gap between when the script runs and when the external CSS
            arrives, during which .intro-hide elements are briefly visible (the flash).
            Inlining these rules here guarantees they apply in the same paint as the
            script. globals.css keeps a copy as a fallback. */}
        <style dangerouslySetInnerHTML={{ __html: `html[data-intro="playing"] .intro-hide{opacity:0!important;pointer-events:none!important;transition:opacity 0.7s cubic-bezier(.16,1,.3,1)!important}html[data-intro="done"] .intro-hide{opacity:1!important;pointer-events:auto!important;transition:opacity 0.7s cubic-bezier(.16,1,.3,1)!important}` }} />
        <style dangerouslySetInnerHTML={{ __html: dsStyle }} />
        {/* Hide system cursor immediately on pointer:fine devices — before JS
            hydration — so there's no flash of the default arrow on load. */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine){*{cursor:none!important}}` }} />
        {/* Theme-aware favicons: dark glyph on light chrome, light glyph on dark chrome */}
        <link rel="icon" type="image/png" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
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
        <Analytics />
      </body>
    </html>
  );
}
