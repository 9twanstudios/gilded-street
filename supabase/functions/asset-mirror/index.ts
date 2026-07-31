import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-shot maintenance function: mirrors Lovable-CDN (/__l5e/...) catalogue images
// into the public `product-images` Supabase bucket so they resolve on any host.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { origin, urls } = await req.json() as { origin: string; urls: string[] };
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: Record<string, string> = {};
    const errors: Record<string, string> = {};

    for (const u of urls) {
      const parts = u.split("/"); // ["", "__l5e", "assets-v1", assetId, filename]
      const assetId = parts[3];
      const filename = parts[4];
      const key = `catalog/${assetId}-${filename}`;
      try {
        const res = await fetch(`${origin}${u}`);
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const { error } = await admin.storage.from("product-images").upload(key, bytes, {
          contentType: res.headers.get("content-type") ?? "image/png",
          upsert: true,
        });
        if (error) throw error;
        results[u] = admin.storage.from("product-images").getPublicUrl(key).data.publicUrl;
      } catch (e) {
        errors[u] = String((e as Error).message ?? e);
      }
    }

    return new Response(JSON.stringify({ ok: true, count: Object.keys(results).length, results, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
