import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { wulfzz, wulfzzConfigured } from "../_shared/wulfzzbyte.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// 5-minute in-memory cache of the upstream catalog (per warm instance).
let cache: { at: number; items: any[] } | null = null;
const TTL = 5 * 60 * 1000;

function extractItems(data: any): any[] {
  if (Array.isArray(data)) return data;
  for (const k of ["items", "products", "data", "catalog"]) if (Array.isArray(data?.[k])) return data[k];
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Admins only" }, 403);
    if (!wulfzzConfigured()) return json({ error: "Wulfzzbyte is not configured" }, 500);

    const force = new URL(req.url).searchParams.get("force") === "1";
    if (force || !cache || Date.now() - cache.at > TTL) {
      const r = await wulfzz("/catalog");
      if (!r.ok) return json({ error: `Wulfzzbyte catalog error (${r.status})` }, 502);
      cache = { at: Date.now(), items: extractItems(r.data) };
    }

    // Flatten upstream into sku -> { price, active }
    const bySku = new Map<string, { price: number | null; active: boolean; title?: string }>();
    for (const it of cache.items) {
      const variants = Array.isArray(it?.variants) ? it.variants : Array.isArray(it?.skus) ? it.skus : [it];
      for (const v of variants) {
        const sku = String(v?.sku ?? "").trim();
        if (!sku) continue;
        const raw = v?.selling_price ?? v?.price ?? it?.selling_price ?? it?.price;
        const price = raw == null ? null : Math.round(Number(raw));
        const active = (v?.active ?? it?.active ?? (it?.status ? it.status === "active" : true)) !== false;
        bySku.set(sku, { price: Number.isFinite(price) ? price : null, active, title: it?.title ?? it?.name });
      }
    }

    const { data: products, error } = await admin.from("products").select("id,name,sku,sku_variants,price,in_stock");
    if (error) throw error;

    let matched = 0;
    const unmatched: string[] = [];
    const now = new Date().toISOString();
    for (const p of products ?? []) {
      const skus = [p.sku, ...Object.values((p.sku_variants ?? {}) as Record<string, string>)].filter(Boolean) as string[];
      if (skus.length === 0) continue;
      const hits = skus.map((s) => bySku.get(s)).filter(Boolean) as { price: number | null; active: boolean }[];
      if (hits.length === 0) { unmatched.push(p.name); continue; }
      const prices = hits.map((h) => h.price).filter((x): x is number => x != null && x > 0);
      const update: Record<string, unknown> = { wulfzz_synced_at: now, in_stock: hits.some((h) => h.active) };
      if (prices.length) update.price = Math.min(...prices);
      await admin.from("products").update(update).eq("id", p.id);
      matched++;
    }

    return json({ upstream_skus: bySku.size, matched, unmatched, cached_at: new Date(cache.at).toISOString() });
  } catch (e) {
    console.error("wulfzz-catalog-sync", e);
    return json({ error: "Catalog sync failed" }, 500);
  }
});
