import { FOOTER_LINKS } from "@/lib/site";

/** Shared about-page content — used by `/about` and `/about/v2`. */

export const EXPERIENCE = [
  {
    slug: "cursor",
    company: "Cursor",
    role: "Campus Ambassador",
    dates: "2026",
    description: "leading growth at ucla",
    logo: "/images/about/logos/cursor.png",
  },
  {
    slug: "joola",
    company: "JOOLA",
    role: "Product Design Intern",
    dates: "Summer 2026",
    description: "pioneers in pickleball & table tennis equipment",
    logo: "/images/about/logos/joola.avif",
  },
  {
    slug: "beaconsAi",
    company: "Beacons AI",
    role: "Product Designer (contract)",
    dates: "2026",
    description: "via Product Space",
    logo: "/images/about/logos/beacons-ai.avif",
  },
  {
    slug: "dialogueAi",
    company: "Dialogue AI",
    role: "Product Designer (contract)",
    dates: "2026",
    description: "via Product Space",
    logo: "/images/about/logos/dialogue-ai.avif",
  },
  {
    slug: "sokaRecords",
    company: "Soka Records",
    role: "Creative Intern",
    dates: "2025",
    description: "keshi, boywithuke, starfall, yel",
    logo: "/images/about/logos/soka-records.avif",
  },
  {
    slug: "mousepad",
    company: "The Mousepad Company",
    role: "Visual Designer",
    dates: "2020 – 2022",
    description: "mousepads and social media",
    logo: "/images/about/logos/mousepad-company.avif",
    hidden: true,
  },
] as const;

export const ORGS = [
  { name: "UCLA Product Space", role: "Product Designer", featured: true as const },
  { name: "Campus Events Commission", role: "Director of Media Production" },
] as const;

/** Photos of UCLA Product Space community (optimized under public/images/about). */
export const PRODUCT_SPACE_PHOTOS = [
  {
    src: "/images/about/product-space/1.webp",
    alt: "UCLA Product Space crew gathered outdoors under string lights",
    caption: "string lights & ship nights",
    width: 1200,
    height: 1200,
  },
  {
    src: "/images/about/product-space/2.webp",
    alt: "UCLA Product Space friends celebrating together indoors",
    caption: "the crew, mid-celebration",
    width: 1200,
    height: 1200,
  },
] as const;

export const ABOUT_INTERESTS = [
  "shooting concerts for iconic artists and venues 📸",
  "building keyboards on youtube (1M+ views!) ⌨️",
  "winning a national table tennis title 🏓",
  "3D printing functional art",
  "running 🏃‍",
] as const;

export const ABOUT_BIO =
  "I'm a designer because I love connecting people through thoughtful interactions. I grew up on the internet, shaped by communities and rabbit holes that taught me thoughtful craft turns ordinary moments into ones worth returning to. What I make is meant to be beautiful and functional, but mostly it's meant to give people a moment of joy they didn't expect.";

export const SOCIALS = FOOTER_LINKS;
