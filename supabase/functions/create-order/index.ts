import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { wulfzz, wulfzzConfigured } from "../_shared/wulfzzbyte.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

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
      .from("products").select("id,name,price,sizes,stock_count,in_stock,approved,sku,sku_variants").in("id", ids);
    if (pErr) throw pErr;
    const map = new Map((products ?? []).map((p: any) => [p.id, p]));

    let total = 0;
    const qtyById: Record<string, number> = {};
    const rows: any[] = [];
    for (const it of items) {
      const p: any = map.get(it.product_id);
      const qty = Math.floor(Number(it.quantity));
      if (!p || !p.approved || p.in_stock === false) return json({ error: `${p?.name ?? "An item"} is unavailable` }, 400);
      if (!(qty >= 1 && qty <= 20)) return json({ error: "Invalid quantity" }, 400);
      if (p.sizes?.length && it.size && !p.sizes.includes(it.size)) return json({ error: `Size ${it.size} not available for ${p.name}` }, 400);
      qtyById[p.id] = (qtyById[p.id] ?? 0) + qty;
      if (p.stock_count != null && qtyById[p.id] > p.stock_count) return json({ error: `Only ${p.stock_count} left of ${p.name}` }, 400);
      const price = Math.round(Number(p.price));
      total += price * qty;
      const sku = (it.size && p.sku_variants?.[it.size]) || p.sku || null;
      rows.push({ product_id: p.id, quantity: qty, size: it.size ?? null, price_at_time: price, sku });
    }

    const a = body?.attribution ?? {};
    const idem = crypto.randomUUID();
    const { data: order, error: oErr } = await admin.from("orders").insert({
      user_id: user.id, total, shipping_address: address, phone, status: "pending",
      attribution: a, traffic_source: a.traffic_source ?? "direct",
      seo_landing_page: a.landing ?? null, search_query: a.search_query ?? null,
      wulfzz_idempotency_key: idem,
    }).select("id,total").single();
    if (oErr) throw oErr;

    const { error: iErr } = await admin.from("order_items").insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (iErr) {
      await admin.from("orders").delete().eq("id", order.id);
      throw iErr;
    }

    // Relay to Wulfzzbyte (source of truth for fulfilment + pricing).
    const externalRef = `9F-${order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    let finalTotal = order.total as number;
    let orderCode: string | null = null;
    const allSkus = rows.every((r) => r.sku);
    if (wulfzzConfigured() && allSkus) {
      try {
        const { data: prof } = await admin.from("profiles").select("full_name,display_name,email").eq("id", user.id).maybeSingle();
        const e164 = phone.startsWith("+") ? phone : phone.startsWith("254") ? `+${phone}` : `+254${phone.slice(1)}`;
        const r = await wulfzz("/orders", {
          method: "POST", idempotencyKey: idem,
          body: {
            external_ref: externalRef,
            items: rows.map((x) => ({ sku: x.sku, quantity: x.quantity })),
            customer: {
              name: prof?.display_name || prof?.full_name || user.email?.split("@")[0] || "Customer",
              phone: e164, email: prof?.email ?? user.email ?? undefined,
              delivery: { address, notes: String(body?.delivery_notes ?? "").slice(0, 300) || undefined },
            },
            notes: "9twanfitz web store order",
          },
        });
        if (r.ok && r.data?.order_code) {
          orderCode = String(r.data.order_code);
          const q = Math.round(Number(r.data.quoted_total));
          if (Number.isFinite(q) && q > 0) finalTotal = q;
          await admin.from("orders").update({
            external_ref: externalRef, wulfzz_order_code: orderCode, wulfzz_quoted_total: finalTotal,
            total: finalTotal, wulfzz_status: "created",
          }).eq("id", order.id);
        } else {
          console.error("wulfzz order relay", r.status, r.data);
          await admin.from("orders").update({ external_ref: externalRef, wulfzz_status: `relay_failed_${r.status}` }).eq("id", order.id);
        }
      } catch (err) {
        console.error("wulfzz order relay error", err);
        await admin.from("orders").update({ external_ref: externalRef, wulfzz_status: "relay_error" }).eq("id", order.id);
      }
    } else {
      await admin.from("orders").update({ external_ref: externalRef, wulfzz_status: allSkus ? "not_configured" : "missing_sku" }).eq("id", order.id);
    }

    return json({ order_id: order.id, total: finalTotal, order_code: orderCode, external_ref: externalRef });
  } catch (e) {
    console.error("create-order", e);
    return json({ error: "Could not place order. Please try again." }, 500);
  }
});
