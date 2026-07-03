export interface Photo {
  slug: string;
  src: string;
  alt: string;
  caption: string;
  aspectRatio: "4/5" | "4/3" | "3/2" | "1/1";
  width: number;
  height: number;
  /** shown on About page (6 featured) */
  featured: boolean;
  /** bg color shown while image loads / as placeholder */
  placeholderBg: string;
}

export const photos: Photo[] = [
  {
    slug: "jcole-oct23",
    src: "/images/photography/jcole-oct23.jpg",
    alt: "J. Cole performing live, October 2023",
    caption: "j.cole | october '23",
    aspectRatio: "4/5",
    width: 800,
    height: 1000,
    featured: true,
    placeholderBg: "#111111",
  },
  {
    slug: "marias-oakland",
    src: "/images/photography/marias-oakland.jpg",
    alt: "The Marias performing at opening night in Oakland",
    caption: "the marias | opening night oakland",
    aspectRatio: "4/3",
    width: 1200,
    height: 900,
    featured: true,
    placeholderBg: "#1f1b2e",
  },
  {
    slug: "2hollis-oct24",
    src: "/images/photography/2hollis-oct24.jpg",
    alt: "2Hollis performing, October 2024",
    caption: "2hollis | october '24",
    aspectRatio: "4/5",
    width: 800,
    height: 1000,
    featured: true,
    placeholderBg: "#1a1a1a",
  },
  {
    slug: "asap-rl25",
    src: "/images/photography/asap-rl25.jpg",
    alt: "ASAP Rocky at Rolling Loud 2025",
    caption: "asap rocky | rolling loud '25",
    aspectRatio: "4/5",
    width: 800,
    height: 1000,
    featured: true,
    placeholderBg: "#0d0d0d",
  },
  {
    slug: "omar-hollywoodbowl",
    src: "/images/photography/omar-hollywoodbowl.jpg",
    alt: "Omar Apollo performing at the Hollywood Bowl",
    caption: "omar apollo | hollywood bowl",
    aspectRatio: "4/3",
    width: 1200,
    height: 900,
    featured: true,
    placeholderBg: "#2a1f3a",
  },
  {
    slug: "gunna-nov24",
    src: "/images/photography/gunna-nov24.jpg",
    alt: "Gunna performing, November 2024",
    caption: "gunna | november '24",
    aspectRatio: "4/5",
    width: 800,
    height: 1000,
    featured: true,
    placeholderBg: "#141414",
  },
  {
    slug: "geonworks",
    src: "/images/photography/geonworks.jpg",
    alt: "Geonworks F1-8X mechanical keyboard",
    caption: "geonworks f1-8x I built",
    aspectRatio: "4/3",
    width: 1200,
    height: 900,
    featured: false,
    placeholderBg: "#d8cfc4",
  },
  {
    slug: "gskt00",
    src: "/images/photography/gskt00.jpg",
    alt: "GSKT-00 keyboard",
    caption: "gskt-00",
    aspectRatio: "4/3",
    width: 1200,
    height: 900,
    featured: false,
    placeholderBg: "#ede8e0",
  },
  {
    slug: "unikorn",
    src: "/images/photography/unikorn.jpg",
    alt: "Unikorn keyboard",
    caption: "unikorn",
    aspectRatio: "4/3",
    width: 1200,
    height: 900,
    featured: false,
    placeholderBg: "#f5f0e8",
  },
];

export const featuredPhotos = photos.filter((p) => p.featured);
export const allPhotos = photos;
