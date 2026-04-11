import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const PESAPAL_API_URL = Deno.env.get("PESAPAL_API_URL") || "https://cybqa.pesapal.com/pesapalv3";
const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getPesapalToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: PESAPAL_CONSUMER_KEY, consumer_secret: PESAPAL_CONSUMER_SECRET }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Failed to get Pesapal token");
  return data.token;
}

async function registerIPN(token: string, callbackUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: callbackUrl, ipn_notification_type: "GET" }),
  });
  const data = await res.json();
  return data.ipn_id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { order_id, callback_url } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify order belongs to user
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user.id)
      .single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const idempotencyKey = `checkout-${order_id}`;

    // Check for existing pending entry
    const { data: existing } = await admin
      .from("ledger_entries")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (!existing) {
      await admin.from("ledger_entries").insert({
        user_id: user.id,
        type: "purchase",
        amount: order.total,
        status: "pending",
        reference: null,
        order_id: order_id,
        description: `Payment for order ${order_id.slice(0, 8)}`,
        idempotency_key: idempotencyKey,
      });
    }

    // Get Pesapal token and register IPN
    const token = await getPesapalToken();
    const ipnUrl = `${SUPABASE_URL}/functions/v1/pesapal-ipn`;
    const ipnId = await registerIPN(token, ipnUrl);

    // Get user profile for billing
    const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();

    // Submit order to Pesapal
    const pesapalOrder = {
      id: order_id,
      currency: "KES",
      amount: order.total / 100, // Convert from cents
      description: `91Fitz Order #${order_id.slice(0, 8)}`,
      callback_url: callback_url || `${req.headers.get("origin") || "https://91fitz.com"}/profile`,
      notification_id: ipnId,
      billing_address: {
        email_address: profile?.email || user.email,
        phone_number: profile?.phone || "",
        first_name: profile?.full_name?.split(" ")[0] || "",
        last_name: profile?.full_name?.split(" ").slice(1).join(" ") || "",
      },
    };

    const orderRes = await fetch(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(pesapalOrder),
    });
    const orderData = await orderRes.json();

    if (orderData.error) {
      throw new Error(orderData.error.message || "Pesapal submission failed");
    }

    // Save tracking ID
    await admin
      .from("orders")
      .update({ payment_reference: orderData.order_tracking_id })
      .eq("id", order_id);

    await admin
      .from("ledger_entries")
      .update({ reference: orderData.order_tracking_id })
      .eq("idempotency_key", idempotencyKey);

    return new Response(JSON.stringify({ redirect_url: orderData.redirect_url, tracking_id: orderData.order_tracking_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("pesapal-checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
