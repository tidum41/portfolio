import { getPlaygroundGallery } from "@/lib/sanity/queries";

export const revalidate = 86400;

export async function GET() {
  const items = await getPlaygroundGallery().catch(() => []);
  return Response.json(items);
}
