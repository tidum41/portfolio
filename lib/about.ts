import { FOOTER_LINKS } from "@/lib/site";

/** Shared about-page content. */

export const EXPERIENCE = [
  {
    slug: "cursor",
    company: "Cursor",
    role: "Campus Ambassador",
    dates: "2026",
    description: "Leading growth at UCLA",
    logo: "/images/about/logos/cursor.png",
  },
  {
    slug: "joola",
    company: "JOOLA",
    role: "Product Design Intern",
    dates: "Summer 2026",
    description: "Pioneers in pickleball & table tennis equipment",
    logo: "/images/about/logos/joola.avif",
  },
  {
    slug: "beaconsAi",
    company: "Beacons AI",
    role: "Product Designer (contract)",
    dates: "2026",
    description: "Via Product Space",
    logo: "/images/about/logos/beacons-ai.avif",
  },
  {
    slug: "dialogueAi",
    company: "Dialogue AI",
    role: "Product Designer (contract)",
    dates: "2026",
    description: "Via Product Space",
    logo: "/images/about/logos/dialogue-ai.avif",
  },
  {
    slug: "sokaRecords",
    company: "Soka Records",
    role: "Creative Intern",
    dates: "2025",
    description: "Keshi, BoyWithUke, Starfall, Yel",
    logo: "/images/about/logos/soka-records.avif",
  },
  {
    slug: "mousepad",
    company: "The Mousepad Company",
    role: "Visual Designer",
    dates: "2020 – 2022",
    description: "Mousepads and social media",
    logo: "/images/about/logos/mousepad-company.avif",
    hidden: true,
  },
] as const;

export const ORGS = [
  {
    name: "UCLA Product Space",
    role: "Product Designer",
    href: "https://www.instagram.com/productspaceatucla/",
  },
  { name: "Campus Events Commission", role: "Director of Media Production" },
  {
    name: "Design Meetup",
    role: "Member, early career cohort",
    href: "https://designmeetup.info/",
  },
] as const;

export const ABOUT_INTERESTS = [
  "Shooting concerts for iconic artists and venues 📸",
  "Building keyboards on YouTube (1M+ views!) ⌨️",
  "Winning a national table tennis title 🏓",
  "3D printing functional art",
  "Running 🏃‍",
] as const;

export const ABOUT_BIO =
  "I'm a designer because I love connecting people through thoughtful interactions. I grew up on the internet, shaped by communities and rabbit holes that taught me thoughtful craft turns ordinary moments into ones worth returning to. What I make is meant to be beautiful and functional, but mostly it's meant to give people a moment of joy they didn't expect.";

export const SOCIALS = FOOTER_LINKS;
