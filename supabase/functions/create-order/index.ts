import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

async function releaseRows(admin: any, rows: any[]) {
  for (const r of rows) {
    const { data } = await admin.from("products").select("stock_count").eq("id", r.product_id).single();
    if (data?.stock_count != null) await admin.from("products").update({ stock_count: data.stock_count + r.quantity, in_stock: true }).eq("id", r.product_id);
  }
}

const PHONE_RE = /^(\+?254|0)(7|1)\d{8}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const body = await req.json();
    const items: { product_id: string; quantity: number; size?: string }[] = Array.isArray(body?.items) ? body.items : [];
    const phone = String(body?.phone ?? "").replace(/\s+/g, "");
    const address = String(body?.shipping_address ?? "").trim().slice(0, 500);
    if (items.length === 0 || items.length > 50) return json({ error: "Cart is empty" }, 400);
    if (!PHONE_RE.test(phone)) return json({ error: "Enter a valid Kenyan phone number (07… or +254…)" }, 400);
    if (address.length < 3) return json({ error: "Enter a delivery address" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ids = [...new Set(items.map((i) => i.product_id))];
    const { data: products, error: pErr } = await admin
      .from("products").select("id,name,price,sizes,stock_count,in_stock,approved,status,creator_id,sku,sku_variants").in("id", ids);
    if (pErr) throw pErr;
    const map = new Map((products ?? []).map((p: any) => [p.id, p]));

    let total = 0;
    const qtyById: Record<string, number> = {};
    const rows: any[] = [];
    for (const it of items) {
      const p: any = map.get(it.product_id);
      const qty = Math.floor(Number(it.quantity));
      if (!p || p.status !== "approved" || p.in_stock === false) return json({ error: `${p?.name ?? "An item"} is unavailable` }, 400);
      if (!(qty >= 1 && qty <= 20)) return json({ error: "Invalid quantity" }, 400);
      if (p.sizes?.length && it.size && !p.sizes.includes(it.size)) return json({ error: `Size ${it.size} not available for ${p.name}` }, 400);
      qtyById[p.id] = (qtyById[p.id] ?? 0) + qty;
      if (p.stock_count != null && qtyById[p.id] > p.stock_count) return json({ error: `Only ${p.stock_count} left of ${p.name}` }, 400);
      const price = Math.round(Number(p.price));
      total += price * qty;
      const sku = (it.size && p.sku_variants?.[it.size]) || p.sku || null;
      rows.push({ product_id: p.id, quantity: qty, size: it.size ?? null, price_at_time: price, sku });
    }

    // Atomically reserve stock before creating the order (prevents overselling).
    const { error: rErr } = await admin.rpc("reserve_stock", {
      _items: rows.map((r) => ({ product_id: r.product_id, quantity: r.quantity })),
    });
    if (rErr) {
      const pid = String(rErr.message).split("OUT_OF_STOCK:")[1];
      const name = pid ? (map.get(pid.trim()) as any)?.name : null;
      return json({ error: `${name ?? "An item"} just sold out` }, 409);
    }

    // Single-creator carts attribute the sale to that creator for the 90/10 split.
    const creatorIds = [...new Set((products ?? []).map((p: any) => p.creator_id).filter(Boolean))];
    const creator_id = creatorIds.length === 1 && (products ?? []).every((p: any) => p.creator_id) ? creatorIds[0] : null;

    const a = body?.attribution ?? {};
    const { data: order, error: oErr } = await admin.from("orders").insert({
      user_id: user.id, total, shipping_address: address, phone, status: "pending", creator_id,
      attribution: a, traffic_source: a.traffic_source ?? "direct",
      seo_landing_page: a.landing ?? null, search_query: a.search_query ?? null,
    }).select("id,total").single();
    if (oErr) {
      await releaseRows(admin, rows);
      throw oErr;
    }

    const { error: iErr } = await admin.from("order_items").insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (iErr) {
      await releaseRows(admin, rows);
      await admin.from("orders").delete().eq("id", order.id);
      throw iErr;
    }

    const externalRef = `9F-${order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    await admin.from("orders").update({ external_ref: externalRef }).eq("id", order.id);

    return json({ order_id: order.id, total: order.total, order_code: externalRef, external_ref: externalRef });
  } catch (e) {
    console.error("create-order", e);
    return json({ error: "Could not place order. Please try again." }, 500);
  }
});
