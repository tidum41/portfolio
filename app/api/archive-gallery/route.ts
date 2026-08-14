import { getPlaygroundGallery } from "@/lib/sanity/queries";

export const revalidate = 60;

export async function GET() {
  const items = await getPlaygroundGallery().catch(() => []);
  return Response.json(items);
}
