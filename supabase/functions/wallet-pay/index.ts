import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PLATFORM_FEE_PERCENT = 10;

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
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get order
    const { data: order, error: orderErr } = await admin.from("orders").select("*").eq("id", order_id).eq("user_id", user.id).single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get wallet
    const { data: wallet } = await admin.from("wallets").select("*").eq("user_id", user.id).single();
    if (!wallet || wallet.balance < order.total) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const idempotencyKey = `wallet-pay-${order_id}`;
    const { data: existing } = await admin.from("ledger_entries").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ error: "Payment already processed" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Deduct from buyer wallet
    await admin.from("wallets").update({ balance: wallet.balance - order.total }).eq("user_id", user.id);

    // Create purchase ledger entry
    await admin.from("ledger_entries").insert({
      user_id: user.id, type: "purchase", amount: order.total, status: "completed",
      reference: `wallet-${order_id}`, order_id, description: `Wallet payment for order ${order_id.slice(0, 8)}`,
      idempotency_key: idempotencyKey,
    });

    // Update order
    await admin.from("orders").update({ status: "processing", payment_reference: `wallet-${order_id}` }).eq("id", order_id);

    // Revenue split if creator product
    if (order.creator_id) {
      const creatorAmount = Math.floor(order.total * (100 - PLATFORM_FEE_PERCENT) / 100);
      const feeAmount = order.total - creatorAmount;

      const { data: creatorWallet } = await admin.from("wallets").select("*").eq("user_id", order.creator_id).single();
      if (creatorWallet) {
        await admin.from("wallets").update({ balance: creatorWallet.balance + creatorAmount }).eq("user_id", order.creator_id);
        await admin.from("ledger_entries").insert({
          user_id: order.creator_id, type: "deposit", amount: creatorAmount, status: "completed",
          reference: `wallet-${order_id}`, order_id, description: `Sale revenue for order ${order_id.slice(0, 8)}`,
          idempotency_key: `creator-credit-${order_id}`,
        });
      }

      await admin.from("ledger_entries").insert({
        user_id: user.id, type: "fee", amount: feeAmount, status: "completed",
        reference: `wallet-${order_id}`, order_id, description: `Platform fee for order ${order_id.slice(0, 8)}`,
        idempotency_key: `platform-fee-${order_id}`,
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("wallet-pay error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
