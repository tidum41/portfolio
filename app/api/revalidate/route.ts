import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = {
  _type: string;
  slug?: string | null;
};

/** Map Sanity `_type` → cache tags used by `unstable_cache` in lib/sanity/queries.ts. */
function tagsForDocument(body: WebhookPayload): string[] {
  const tags = new Set<string>(["sanity"]);

  switch (body._type) {
    case "designSystem":
      tags.add("design-system");
      break;
    case "project":
      tags.add("projects");
      break;
    case "caseStudy": {
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      if (slug) tags.add(`case-study:${slug}`);
      break;
    }
    case "playgroundGallery":
      tags.add("archive");
      break;
    default:
      // Still bust the shared `sanity` tag so unknown types refresh shared caches.
      break;
  }

  return [...tags];
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET;
    if (!secret) {
      return new Response("Missing environment variable SANITY_REVALIDATE_SECRET", {
        status: 500,
      });
    }

    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      secret,
      true,
    );

    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ message: "Invalid signature", isValidSignature, body }),
        { status: 401 },
      );
    }

    if (!body?._type) {
      return new Response(JSON.stringify({ message: "Bad Request", body }), {
        status: 400,
      });
    }

    const tags = tagsForDocument(body);
    for (const tag of tags) {
      // Next.js 16 requires a cacheLife profile as the second argument.
      revalidateTag(tag, "max");
    }

    return NextResponse.json({ revalidated: true, tags, body });
  } catch (err: unknown) {
    console.error("[api/revalidate]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(message, { status: 500 });
  }
}
