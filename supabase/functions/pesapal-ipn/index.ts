import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const PESAPAL_API_URL = Deno.env.get("PESAPAL_API_URL") || "https://cybqa.pesapal.com/pesapalv3";
const PESAPAL_CONSUMER_KEY = Deno.env.get("PESAPAL_CONSUMER_KEY")!;
const PESAPAL_CONSUMER_SECRET = Deno.env.get("PESAPAL_CONSUMER_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLATFORM_FEE_PERCENT = 10;

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

Deno.serve(async (req) => {
  // IPN comes as GET with query params
  const url = new URL(req.url);
  const orderTrackingId = url.searchParams.get("OrderTrackingId");
  const orderMerchantReference = url.searchParams.get("OrderMerchantReference");

  if (!orderTrackingId || !orderMerchantReference) {
    return new Response("Missing parameters", { status: 400 });
  }

  try {
    const token = await getPesapalToken();
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify transaction status with Pesapal
    const statusRes = await fetch(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
    );
    const statusData = await statusRes.json();

    const paymentStatus = statusData.payment_status_description;
    console.log(`IPN: order=${orderMerchantReference} tracking=${orderTrackingId} status=${paymentStatus}`);

    if (paymentStatus === "Completed") {
      // Update order status
      await admin.from("orders").update({ status: "processing" }).eq("id", orderMerchantReference);

      // Update ledger entry to completed
      const idempotencyKey = `checkout-${orderMerchantReference}`;
      await admin.from("ledger_entries").update({ status: "completed" }).eq("idempotency_key", idempotencyKey);

      // Get order details for revenue split
      const { data: order } = await admin.from("orders").select("*").eq("id", orderMerchantReference).single();
      if (!order) throw new Error("Order not found");

      if (order.creator_id) {
        // 90/10 split: credit creator wallet, credit platform fee
        const creatorAmount = Math.floor(order.total * (100 - PLATFORM_FEE_PERCENT) / 100);
        const feeAmount = order.total - creatorAmount;

        // Credit creator wallet
        const { data: creatorWallet } = await admin.from("wallets").select("*").eq("user_id", order.creator_id).single();
        if (creatorWallet) {
          await admin.from("wallets").update({ balance: creatorWallet.balance + creatorAmount }).eq("user_id", order.creator_id);
          await admin.from("ledger_entries").insert({
            user_id: order.creator_id,
            type: "deposit",
            amount: creatorAmount,
            status: "completed",
            reference: orderTrackingId,
            order_id: order.id,
            description: `Sale revenue for order ${order.id.slice(0, 8)}`,
            idempotency_key: `creator-credit-${order.id}`,
          });
        }

        // Platform fee ledger entry (tracked under buyer)
        await admin.from("ledger_entries").insert({
          user_id: order.user_id,
          type: "fee",
          amount: feeAmount,
          status: "completed",
          reference: orderTrackingId,
          order_id: order.id,
          description: `Platform fee for order ${order.id.slice(0, 8)}`,
          idempotency_key: `platform-fee-${order.id}`,
        });
      }
    } else if (paymentStatus === "Failed" || paymentStatus === "Invalid") {
      await admin.from("orders").update({ status: "cancelled" }).eq("id", orderMerchantReference);
      const idempotencyKey = `checkout-${orderMerchantReference}`;
      await admin.from("ledger_entries").update({ status: "failed" }).eq("idempotency_key", idempotencyKey);
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("pesapal-ipn error:", err);
    return new Response("Error", { status: 500 });
  }
});
