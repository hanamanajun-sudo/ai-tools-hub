import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const bucket = (env as any).BLOG_ASSETS;

    if (!bucket) {
      return Response.json({ ok: false, reason: "BLOG_ASSETS binding is null" });
    }

    // test write
    await bucket.put("_test", "ok");
    const obj = await bucket.get("_test");
    const val = obj ? await obj.text() : null;
    await bucket.delete("_test");

    return Response.json({ ok: true, r2_write: val === "ok", bucket: "blog-assets" });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e) });
  }
}
