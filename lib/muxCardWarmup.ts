import { unstable_cache } from "next/cache";
import { getProjects } from "@/lib/sanity/queries";

export type MuxCardWarm = {
  /** CDN origins for the startup rendition (TLS before the first segment). */
  preconnect: string[];
  /**
   * Playlist + init + first media segment for the two cards on screen at
   * intro end. Phone-sized only — see the media query on the link tags.
   * `playbackId` is set on the playlist URL so the player can open that
   * exact file (the one already in the preload cache).
   */
  preload: { href: string; playbackId?: string }[];
};

const EMPTY: MuxCardWarm = { preconnect: [], preload: [] };

/**
 * First video in each grid column. That is the pair sitting in the viewport
 * when the intro ends (left column even indexes, right column odd).
 */
function startupPlaybackIds(
  projects: { mediaType?: string; muxPlaybackId?: string }[],
): string[] {
  const ids: string[] = [];
  for (const column of [0, 1]) {
    const hit = projects
      .filter((_, index) => index % 2 === column)
      .find((project) => project.mediaType === "video" && project.muxPlaybackId);
    if (hit?.muxPlaybackId) ids.push(hit.muxPlaybackId);
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

async function warmOne(id: string): Promise<{ playlist: string; urls: string[] } | null> {
  const masterUrl = `https://stream.mux.com/${id}.m3u8?max_resolution=480p`;
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
  const urls = [playlist, ...firstMedia(await mediaRes.text(), playlist)];
  return { playlist, urls };
}

async function loadWarm(ids: string[]): Promise<MuxCardWarm> {
  const settled = await Promise.all(ids.map((id) => warmOne(id).catch(() => null)));
  const preload: MuxCardWarm["preload"] = [];
  const origins = new Set<string>();
  ids.forEach((id, index) => {
    const hit = settled[index];
    if (!hit) return;
    for (const url of hit.urls) {
      preload.push({ href: url, playbackId: url === hit.playlist ? id : undefined });
      try {
        origins.add(new URL(url).origin);
      } catch {
        /* skip */
      }
    }
  });
  return { preconnect: [...origins], preload };
}

/**
 * Resolves the phone startup rendition while the page is built.
 * Mux signs these URLs for about a year; a failed lookup just skips the
 * warmup and the player fetches the master itself.
 */
export function getMuxCardWarmup(): Promise<MuxCardWarm> {
  return getProjects()
    .then((projects) => {
      const ids = startupPlaybackIds(projects);
      if (!ids.length) return EMPTY;
      return unstable_cache(() => loadWarm(ids), ["mux-card-warm-v2", ids.join(",")], {
        revalidate: 3600,
      })();
    })
    .catch(() => EMPTY);
}
