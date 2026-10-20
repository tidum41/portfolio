import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getProjects } from "@/lib/sanity/queries";

export type MuxWarmEntry = {
  url480?: string;
  url720?: string;
  text480?: string;
  text720?: string;
  segs480?: string[];
  segs720?: string[];
};

export type MuxCardWarm = {
  /** CDN origins for the startup rendition (TLS before the first segment). */
  preconnect: string[];
  /**
   * Init + first media segment for the two cards on screen at intro end,
   * for both phone (480p) and desktop (720p) viewports.
   */
  preload: {
    href: string;
    playbackId?: string;
    aboveFold?: boolean;
    media?: string;
  }[];
  /** Pre-resolved playlists (URLs + inline manifest text) for all video cards. */
  playlists: Record<string, MuxWarmEntry>;
};

const EMPTY: MuxCardWarm = { preconnect: [], preload: [], playlists: {} };

/**
 * All featured video playback IDs, ordered so the first video in each grid
 * column (the pair sitting in the viewport when the intro ends) comes first.
 */
function orderedPlaybackIds(
  projects: { mediaType?: string; muxPlaybackId?: string }[],
): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const column of [0, 1]) {
    const hit = projects
      .filter((_, index) => index % 2 === column)
      .find((project) => project.mediaType === "video" && project.muxPlaybackId);
    if (hit?.muxPlaybackId && !seen.has(hit.muxPlaybackId)) {
      seen.add(hit.muxPlaybackId);
      ids.push(hit.muxPlaybackId);
    }
  }
  for (const project of projects) {
    if (project.mediaType === "video" && project.muxPlaybackId && !seen.has(project.muxPlaybackId)) {
      seen.add(project.muxPlaybackId);
      ids.push(project.muxPlaybackId);
    }
  }
  return ids;
}

function resolveUrl(ref: string, base: string): string | null {
  try {
    return new URL(ref, base).href;
  } catch {
    return null;
  }
}

/** Normalize all segment/map URIs in a media playlist to absolute URLs so it can load from a blob: URL. */
function absolutizePlaylist(playlistText: string, playlistUrl: string): string {
  return playlistText
    .split(/\r?\n/)
    .map((raw) => {
      const line = raw.trim();
      if (!line) return raw;
      if (line.startsWith("#EXT-X-MAP:")) {
        return line.replace(/URI="([^"]+)"/, (match, uri: string) => {
          const abs = resolveUrl(uri, playlistUrl);
          return abs ? `URI="${abs}"` : match;
        });
      }
      if (!line.startsWith("#")) {
        return resolveUrl(line, playlistUrl) ?? line;
      }
      return line;
    })
    .join("\n");
}

/** Init map plus the first segment. The poster frame (t=1) sits inside it. */
function firstMedia(playlistText: string, playlistUrl: string): string[] {
  const lines = playlistText.split(/\r?\n/);
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXT-X-MAP:")) {
      const uri = line.match(/URI="([^"]+)"/)?.[1];
      if (uri) {
        const abs = resolveUrl(uri, playlistUrl);
        if (abs) out.push(abs);
      }
    }
    if (line.startsWith("#EXTINF:")) {
      const seg = lines[i + 1]?.trim();
      if (seg && !seg.startsWith("#")) {
        const abs = resolveUrl(seg, playlistUrl);
        if (abs) out.push(abs);
      }
      break;
    }
  }
  return out;
}

function pickStartupVariant(master: string, masterUrl: string): string | null {
  const lines = master.split(/\r?\n/);
  let bestBw = -1;
  let bestUrl: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("#EXT-X-STREAM-INF:")) continue;
    const bw = Number(line.match(/BANDWIDTH=(\d+)/)?.[1] ?? -1);
    const uri = lines[i + 1]?.trim();
    if (!uri || uri.startsWith("#")) continue;
    if (bw > bestBw) {
      bestBw = bw;
      bestUrl = resolveUrl(uri, masterUrl);
    }
  }
  return bestUrl;
}

async function warmRendition(
  id: string,
  cap: "480p" | "720p",
): Promise<{ playlist: string; text: string; firstSegments: string[] } | null> {
  const masterUrl = `https://stream.mux.com/${id}.m3u8?max_resolution=${cap}`;
  const masterRes = await fetch(masterUrl, {
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!masterRes.ok) return null;
  const master = await masterRes.text();
  const playlist = pickStartupVariant(master, masterUrl);
  if (!playlist) return null;
  const mediaRes = await fetch(playlist, {
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!mediaRes.ok) return null;
  const rawText = await mediaRes.text();
  const text = absolutizePlaylist(rawText, playlist);
  const firstSegments = firstMedia(rawText, playlist);
  return { playlist, text, firstSegments };
}

async function loadWarm(ids: string[]): Promise<MuxCardWarm> {
  const settled = await Promise.all(
    ids.map(async (id) => {
      const [r480, r720] = await Promise.all([
        warmRendition(id, "480p").catch(() => null),
        warmRendition(id, "720p").catch(() => null),
      ]);
      return { id, r480, r720 };
    }),
  );

  const preload: MuxCardWarm["preload"] = [];
  const origins = new Set<string>();
  const playlists: Record<string, MuxWarmEntry> = {};

  const addOrigin = (url: string) => {
    try {
      origins.add(new URL(url).origin);
    } catch {
      /* skip */
    }
  };

  settled.forEach(({ id, r480, r720 }, index) => {
    if (!r480 && !r720) return;
    playlists[id] = {
      url480: r480?.playlist,
      url720: r720?.playlist,
      text480: r480?.text,
      text720: r720?.text,
      ...(index < 2
        ? {
            segs480: r480?.firstSegments,
            segs720: r720?.firstSegments,
          }
        : {}),
    };

    if (r480) {
      addOrigin(r480.playlist);
      for (const seg of r480.firstSegments) addOrigin(seg);
      if (index < 2) {
        const media =
          index === 0
            ? "(max-width: 800px) and (prefers-reduced-motion: no-preference)"
            : "(min-width: 768px) and (max-width: 800px) and (prefers-reduced-motion: no-preference)";
        for (const seg of r480.firstSegments) {
          preload.push({ href: seg, aboveFold: index === 0, media });
        }
      }
    }

    if (r720) {
      addOrigin(r720.playlist);
      for (const seg of r720.firstSegments) addOrigin(seg);
      if (index < 2) {
        const media = "(min-width: 801px) and (prefers-reduced-motion: no-preference)";
        for (const seg of r720.firstSegments) {
          preload.push({ href: seg, aboveFold: true, media });
        }
      }
    }
  });

  return { preconnect: [...origins], preload, playlists };
}

/**
 * Resolves startup renditions (480p + 720p) while the page is built.
 * Mux signs these URLs for about a year; a failed lookup just skips the
 * warmup and the player fetches the master itself.
 */
export const getMuxCardWarmup = cache((): Promise<MuxCardWarm> => {
  return getProjects()
    .then((projects) => {
      const ids = orderedPlaybackIds(projects);
      if (!ids.length) return EMPTY;
      return unstable_cache(() => loadWarm(ids), ["mux-card-warm-v6", ids.join(",")], {
        revalidate: 86400,
      })();
    })
    .catch(() => EMPTY);
});
