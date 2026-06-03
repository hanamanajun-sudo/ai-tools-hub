import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join("/");

    const { env } = getCloudflareContext();
    const bucket = (env as any).BLOG_ASSETS;

    if (!bucket) return new Response("R2 not configured", { status: 503 });

    const object = await bucket.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    const contentType = object.httpMetadata?.contentType ?? "image/jpeg";

    return new Response(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": object.etag,
      },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
