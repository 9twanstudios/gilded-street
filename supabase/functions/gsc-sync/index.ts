// gsc-sync — pulls Google Search Console rows for the configured site and
// upserts into seo_metrics. Stub-safe: if the GSC connector is not yet
// configured, returns a structured "not_connected" status so the UI can
// surface a helpful message instead of a 500.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = Deno.env.get("GSC_SITE_URL") || "https://91fitz.com/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");

  if (!lovableKey || !gscKey) {
    return new Response(
      JSON.stringify({ status: "not_connected", message: "Connect Google Search Console in Lovable Cloud → Connectors to enable sync." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }

  const { days = 7 } = await req.json().catch(() => ({}));
  const end = new Date(); const start = new Date(Date.now() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gscKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: fmt(start), endDate: fmt(end),
        dimensions: ["page", "query"], rowLimit: 500,
      }),
    });
    if (!res.ok) throw new Error(`GSC ${res.status}: ${await res.text()}`);
    const body = await res.json();
    const rows = body.rows || [];

    const upserts = rows.map((r: any) => {
      const [page, query] = r.keys;
      return {
        entity_type: "page",
        url: page,
        date: fmt(end),
        impressions: r.impressions || 0,
        clicks: r.clicks || 0,
        ctr: r.ctr || 0,
        avg_position: r.position || 0,
        indexed: true,
        top_query: query,
      };
    });
    if (upserts.length) {
      await supabase.from("seo_metrics").upsert(upserts as any, { onConflict: "entity_type,entity_id,date,url" });
    }

    // CTR-drop alert: any url with >50 imp and ctr<1%
    const drops = upserts.filter((u: any) => u.impressions > 50 && u.ctr < 0.01);
    if (drops.length) {
      await supabase.from("seo_alerts").insert(
        drops.slice(0, 20).map((d: any) => ({
          type: "low_ctr", severity: "warn", url: d.url,
          message: `Low CTR (${(d.ctr * 100).toFixed(2)}%) on ${d.url}`,
        })) as any
      );
    }

    return new Response(JSON.stringify({ status: "ok", rows: upserts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ status: "error", message: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
