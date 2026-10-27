import gunna from "@/public/playground/gunna.webp";
import jcole from "@/public/playground/jcole.webp";
import holl from "@/public/playground/2hollis.webp";
import omar from "@/public/playground/omar-apollo.webp";
import marias from "@/public/playground/the-marias.webp";
import concert from "@/public/playground/concert.webp";
import keyboard from "@/public/playground/keyboard.webp";

export type ArchiveTag = "concerts" | "keyboards";

export type ArchivePhoto = {
  id: string;
  src: string;
  tag: ArchiveTag;
  artist: string;
  venue: string;
  year: string;
  alt: string;
};

function srcOf(mod: string | { src: string }): string {
  return typeof mod === "string" ? mod : mod.src;
}

/** Local playground assets. Credits stay placeholder until the real list lands. */
export const ARCHIVE_PHOTOS: ArchivePhoto[] = [
  {
    id: "gunna",
    src: srcOf(gunna),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Concert photo",
  },
  {
    id: "jcole",
    src: srcOf(jcole),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Concert photo",
  },
  {
    id: "2hollis",
    src: srcOf(holl),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Concert photo",
  },
  {
    id: "omar-apollo",
    src: srcOf(omar),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Concert photo",
  },
  {
    id: "the-marias",
    src: srcOf(marias),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Concert photo",
  },
  {
    id: "concert",
    src: srcOf(concert),
    tag: "concerts",
    artist: "Artist",
    venue: "Venue",
    year: "Year",
    alt: "Crowd photo",
  },
  {
    id: "keyboard",
    src: srcOf(keyboard),
    tag: "keyboards",
    artist: "Build",
    venue: "Bench",
    year: "Year",
    alt: "Keyboard build photo",
  },
];

export const CONCERT_PHOTOS = ARCHIVE_PHOTOS.filter((p) => p.tag === "concerts");
export const KEYBOARD_PHOTOS = [
  ARCHIVE_PHOTOS.find((p) => p.id === "keyboard")!,
  {
    id: "keyboard-2",
    src: srcOf(keyboard),
    tag: "keyboards" as const,
    artist: "Build",
    venue: "Bench",
    year: "Year",
    alt: "Keyboard build photo",
  },
  {
    id: "keyboard-3",
    src: srcOf(keyboard),
    tag: "keyboards" as const,
    artist: "Build",
    venue: "Bench",
    year: "Year",
    alt: "Keyboard build photo",
  },
];

export const YOUTUBE_PLACEHOLDER = "https://www.youtube.com/@muditm";

export type LayoutId = "contact" | "setlist" | "turntable";

export function creditLine(photo: ArchivePhoto) {
  return `${photo.artist} · ${photo.venue} · ${photo.year}`;
}
