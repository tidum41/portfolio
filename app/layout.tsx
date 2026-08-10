import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "dialkit/styles.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import GlobalCustomCursor from "@/components/GlobalCustomCursor";
import UiSoundRoot from "@/components/UiSoundRoot";
import AnimationProvider from "@/components/AnimationProvider";
import DevToolbar from "@/components/DevToolbar";
import { PersistentWorkShell } from "@/components/PersistentWorkShell";
import PersistentSilkLayer from "@/components/PersistentSilkLayer";
import { getDesignSystem, designSystemToCss, getProjects, DS_DEFAULTS, type DesignSystemData, type SanityProject } from "@/lib/sanity/queries";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { Analytics } from '@vercel/analytics/next';

// Geist Mono: CD Player "MM-7" + drag hint. Geist Sans: habit tracker embed.
// Site body copy stays on --font-sans/--font-mono ("HN"/Söhne Mono).
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const OG_IMAGES = [
  {
    url: OG_IMAGE_PATH,
    width: 1200,
    height: 630,
    alt: OG_IMAGE_ALT,
  },
];

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
  // Non-media defaults first so Google/Search can pick a stable icon.
  // Theme-aware 32px variants remain for modern browser tabs.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      {
        url: "/favicon-32-light.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-32-dark.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
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
      className={`${geistSans.variable} ${geistMono.variable}`}
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
            hydration — so there's no flash of the default arrow on load.
            Scoped out of prefers-reduced-motion: bootCursor() (GlobalCustomCursor.tsx)
            never mounts its replacement animation for those visitors, so hiding
            the native cursor here would otherwise leave them with no cursor at all. */}
        <style dangerouslySetInnerHTML={{ __html: `@media(pointer:fine) and (prefers-reduced-motion:no-preference){*{cursor:none!important}}` }} />
        {/* Icons also declared in `metadata.icons` — keep a plain fallback here
            for crawlers that only read the first non-media icon link. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" href="/favicon-32-light.png" sizes="32x32" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/favicon-32-dark.png" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <JsonLd />
      </head>
      <body style={{ fontFamily: "var(--font-sans)", background: "var(--color-bg)" }}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GlobalCustomCursor />
        <UiSoundRoot />
        <Nav />
        <main id="main-content" style={{ position: "relative" }}>
          {/* Mounted once, unconditionally, for the whole session — never
              unmounted by route changes. See PersistentWorkShell for why. */}
          <PersistentSilkLayer />
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
