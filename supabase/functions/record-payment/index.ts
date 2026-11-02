import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const METHODS = ["mpesa_till", "mpesa_paybill", "mpesa_pochi", "cash"];
const CODE_RE = /^[A-Z0-9]{8,12}$/;
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

    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.order_id ?? "");
    const method = String(body?.method ?? "mpesa_till");
    const code = String(body?.provider_reference ?? "").trim().toUpperCase();
    const phone = String(body?.payer_phone ?? "").replace(/\s+/g, "");
    if (!METHODS.includes(method)) return json({ error: "Invalid payment method" }, 400);
    if (method !== "cash" && !CODE_RE.test(code)) return json({ error: "Enter a valid M-Pesa confirmation code" }, 400);
    if (!PHONE_RE.test(phone)) return json({ error: "Enter a valid Kenyan phone number" }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order } = await admin.from("orders")
      .select("id,user_id,total,payment_reference")
      .eq("id", orderId).maybeSingle();
    if (!order || order.user_id !== user.id) return json({ error: "Order not found" }, 404);
    if (order.payment_reference) return json({ ok: true, status: "pending_confirmation" });

    await admin.from("orders").update({
      payment_reference: code || "cash", payment_method: method,
      payment_submitted_at: new Date().toISOString(),
    }).eq("id", order.id);

    return json({ ok: true, status: "pending_confirmation" });
  } catch (e) {
    console.error("record-payment", e);
    return json({ error: "Could not submit payment" }, 500);
  }
});
