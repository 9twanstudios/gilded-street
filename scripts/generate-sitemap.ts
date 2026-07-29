/**
 * Sitemap generator — runs predev/prebuild. Pulls published products,
 * drops, journal entries, seo_clusters, seo_locations from Supabase
 * and writes public/sitemap.xml. Falls back gracefully when offline.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const ORIGIN = process.env.SITE_ORIGIN || "https://91fitz.com";

const STATIC = ["/", "/shop", "/drops", "/journal", "/login", "/signup"];

async function main() {
  const urls = new Set<string>(STATIC.map((p) => `${ORIGIN}${p}`));
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
      const tables = [
        { name: "products", prefix: "/products/", filter: { status: "approved" } },
        { name: "drops", prefix: "/drops/", filter: { active: true } },
        { name: "blog_posts", prefix: "/journal/", filter: { published: true } },
        { name: "seo_clusters", prefix: "/c/", filter: { published: true } },
        { name: "seo_locations", prefix: "/l/", filter: { published: true } },
      ];
      for (const t of tables) {
        let q = sb.from(t.name as any).select("slug");
        for (const [k, v] of Object.entries(t.filter)) q = q.eq(k, v as any);
        const { data } = await q;
        (data || []).forEach((r: any) => r.slug && urls.add(`${ORIGIN}${t.prefix}${r.slug}`));
      }
    } catch (e) { console.warn("[sitemap] supabase fetch failed:", (e as any).message); }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`;
  mkdirSync(resolve("public"), { recursive: true });
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`[sitemap] wrote ${urls.size} urls`);
}
main().catch((e) => { console.error(e); process.exit(0); });
