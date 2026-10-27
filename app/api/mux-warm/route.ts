import { getMuxCardWarmup } from "@/lib/muxCardWarmup";

// playbackId → pre-resolved 480p/720p playlists for the Work grid. Fetched by
// the "/" HLS boot script in parallel with the page's JS, so the map is not in
// any document (it is only used on "/"), cached like the warmup itself.
export const revalidate = 86400;
export async function GET() {
  const warm = await getMuxCardWarmup();
  return Response.json(warm.playlists);
}
