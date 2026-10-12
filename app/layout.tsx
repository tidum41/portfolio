import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getSiteJsonLd } from "@/components/JsonLd";
import SiteChrome from "@/components/SiteChrome";
import { getDesignSystem, designSystemToCss, getProjects, DS_DEFAULTS, type DesignSystemData, type SanityProject } from "@/lib/sanity/queries";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

// ABC Areal is the only sans on the site. Georgia stays on page titles.
// Variable file axes: wght 400–700 (default 400), slnt -12–0 (default 0),
// DRKM 0–1 (default 0). Leave DRKM at the light default.
// The variable woff2 is committed so preview builds can load it.
const areal = localFont({
  src: "../fonts/ABCArealVariable.woff2",
  variable: "--font-areal",
  weight: "400 700",
  display: "swap",
  adjustFontFallback: "Arial",
});

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
  // Archive gallery is NOT fetched here — serializing LQIP data-URIs +
  // 2000px Sanity URLs into every `/` HTML payload was first-load bloat.
  // PersistentArchiveShell + PrimaryRouteWarmup hydrate it after intro.
  const [ds, projects] = await Promise.all([
    getDesignSystem(),
    getProjects(),
  ]).catch(
    () =>
      [DS_DEFAULTS, []] as [Required<DesignSystemData>, SanityProject[]]
  );
  const dsStyle = designSystemToCss(ds);

  return (
    <html
      lang="en"
      className={areal.variable}
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
        {/* Intro gate CSS — must be inline, not in globals.css. The blocking
            beforeInteractive script below sets data-intro="playing"
            synchronously, but globals.css is an external stylesheet that loads
            separately over the network. On production there is a gap between
            when the script runs and when the external CSS arrives, during which
            .intro-hide elements are briefly visible (the flash). Inlining these
            rules here guarantees they apply in the same paint as the script.
            globals.css keeps a copy as a fallback. */}
        <style dangerouslySetInnerHTML={{ __html: `html[data-intro="playing"] .intro-hide{opacity:0!important;pointer-events:none!important;transition:opacity 0.7s cubic-bezier(.16,1,.3,1)!important}html[data-intro="done"] .intro-hide{opacity:1!important;pointer-events:auto!important;transition:opacity 0.7s cubic-bezier(.16,1,.3,1)!important}html[data-intro="playing"] .intro-hide--snap,html[data-intro="done"] .intro-hide--snap{transition:none!important}` }} />
        <style dangerouslySetInnerHTML={{ __html: dsStyle }} />
        {/* Icons also declared in `metadata.icons` — keep a plain fallback here
            for crawlers that only read the first non-media icon link. */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" href="/favicon-32-light.png" sizes="32x32" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" href="/favicon-32-dark.png" sizes="32x32" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://image.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://stream.mux.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "var(--font-sans)", background: "var(--color-bg)" }}>
        {/* Chrome gated in SiteChrome so /dev/card-lab never mounts nav,
            shells, DialKit, analytics, etc. Live routes unchanged. */}
        <SiteChrome projects={projects} jsonLd={getSiteJsonLd()}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
