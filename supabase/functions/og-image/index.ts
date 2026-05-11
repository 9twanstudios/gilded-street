/**
 * LDX v14 — Dynamic OG image generator.
 * Renders 1200×630 SVG branded share cards for products / drops / stories / clusters.
 * Uses pure SVG (no satori dep) for cold-start safety; cached 24h.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!));
}

function svg(title: string, subtitle: string, badge: string): string {
  const t = escapeXml(title.slice(0, 80));
  const s = escapeXml(subtitle.slice(0, 120));
  const b = escapeXml(badge.toUpperCase());
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#000000"/>
      <stop offset="1" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFD700"/>
      <stop offset="1" stop-color="#B8860B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="url(#gold)"/>
  <rect x="0" y="624" width="1200" height="6" fill="url(#gold)"/>
  <text x="60" y="120" font-family="Arial Black, sans-serif" font-size="34" fill="#FFD700" letter-spacing="6">91FITZ</text>
  <text x="60" y="160" font-family="Arial, sans-serif" font-size="18" fill="#888" letter-spacing="4">${b}</text>
  <text x="60" y="320" font-family="Arial Black, sans-serif" font-size="72" fill="#FFFFFF">
    <tspan x="60" dy="0">${t}</tspan>
  </text>
  <text x="60" y="430" font-family="Arial, sans-serif" font-size="28" fill="#cccccc">
    <tspan x="60" dy="0">${s}</tspan>
  </text>
  <text x="60" y="560" font-family="Arial, sans-serif" font-size="20" fill="#FFD700" letter-spacing="3">NOT MERCH. UNIFORM.</text>
  <text x="1140" y="560" font-family="Arial, sans-serif" font-size="18" fill="#888" text-anchor="end">91fitz.com</text>
</svg>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "default";
    const id = url.searchParams.get("id");
    const titleOverride = url.searchParams.get("title");

    let title = titleOverride ?? "Pan-African Streetwear";
    let subtitle = "From Nairobi to the World";
    let badge = type;

    if (id) {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const tableMap: Record<string, string> = {
        product: "products", drop: "drops", story: "stories", cluster: "seo_clusters",
      };
      const table = tableMap[type];
      if (table) {
        const { data } = await admin.from(table).select("*").eq("id", id).maybeSingle();
        if (data) {
          title = data.name || data.title || title;
          subtitle = data.description || data.excerpt || data.meta_description || subtitle;
        }
      }
    }

    const body = svg(title, subtitle, badge);
    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("og-image error", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
