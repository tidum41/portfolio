export type ArchiveTag = "concerts" | "keyboards" | "life";

export type ArchivePhoto = {
  id: string;
  src: string;
  tag: ArchiveTag;
  credit: string;
  alt: string;
};

/** Local playground assets already in the repo. Credits are placeholders. */
export const ARCHIVE_PHOTOS: ArchivePhoto[] = [
  {
    id: "gunna",
    src: "/playground/gunna.webp",
    tag: "concerts",
    credit: "Artist · Venue · Year",
    alt: "Concert photo",
  },
  {
    id: "jcole",
    src: "/playground/jcole.webp",
    tag: "concerts",
    credit: "Artist · Venue · Year",
    alt: "Concert photo",
  },
  {
    id: "2hollis",
    src: "/playground/2hollis.webp",
    tag: "concerts",
    credit: "Artist · Venue · Year",
    alt: "Concert photo",
  },
  {
    id: "omar-apollo",
    src: "/playground/omar-apollo.webp",
    tag: "concerts",
    credit: "Artist · Venue · Year",
    alt: "Concert photo",
  },
  {
    id: "the-marias",
    src: "/playground/the-marias.webp",
    tag: "concerts",
    credit: "Artist · Venue · Year",
    alt: "Concert photo",
  },
  {
    id: "concert",
    src: "/playground/concert.webp",
    tag: "life",
    credit: "Artist · Venue · Year",
    alt: "Crowd photo",
  },
  {
    id: "keyboard",
    src: "/playground/keyboard.webp",
    tag: "keyboards",
    credit: "Build · Bench · Year",
    alt: "Keyboard build photo",
  },
];

export const KEYBOARD_BUILD_PHOTOS: ArchivePhoto[] = [
  ARCHIVE_PHOTOS.find((p) => p.id === "keyboard")!,
  {
    id: "keyboard-2",
    src: "/playground/keyboard.webp",
    tag: "keyboards",
    credit: "Build · Bench · Year",
    alt: "Keyboard build photo",
  },
  {
    id: "keyboard-3",
    src: "/playground/keyboard.webp",
    tag: "keyboards",
    credit: "Build · Bench · Year",
    alt: "Keyboard build photo",
  },
];

export const INTRO_LINE =
  "Concert photography and keyboard builds sit next to the design work. The archive is for the things I keep returning to.";

export const PASSIONS = [
  {
    id: "concert-photography",
    title: "Concert photography",
    blurb: "Shows, pits, and stages. Placeholder credits until the real list lands.",
    tag: "concerts" as const,
  },
  {
    id: "keyboards",
    title: "Keyboards",
    blurb: "Builds filmed for YouTube. Parts, soldering, and the finished boards.",
    tag: "keyboards" as const,
  },
  {
    id: "life",
    title: "Life",
    blurb: "Everything else that did not fit a tighter label.",
    tag: "life" as const,
  },
];

export type DirectionId = "chapters" | "tagged" | "index";

export const DIRECTIONS: { id: DirectionId; label: string; hint: string }[] = [
  {
    id: "chapters",
    label: "A Chapters",
    hint: "Intro, Concerts, Keyboards, then More as the infinite gallery",
  },
  {
    id: "tagged",
    label: "B Tagged",
    hint: "Infinite scroll with sticky All / Concerts / Keyboards / Life filters",
  },
  {
    id: "index",
    label: "C Index",
    hint: "Text-first passion list that expands into horizontal strips",
  },
];

export type SectionId = "concerts" | "keyboards" | "more";

export const SECTION_ORDERS: {
  id: string;
  label: string;
  order: SectionId[];
}[] = [
  {
    id: "ckm",
    label: "Concerts, Keyboards, More",
    order: ["concerts", "keyboards", "more"],
  },
  {
    id: "kcm",
    label: "Keyboards, Concerts, More",
    order: ["keyboards", "concerts", "more"],
  },
  {
    id: "cmk",
    label: "Concerts, More, Keyboards",
    order: ["concerts", "more", "keyboards"],
  },
  {
    id: "mck",
    label: "More, Concerts, Keyboards",
    order: ["more", "concerts", "keyboards"],
  },
];
