import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

/**
 * Pesapal IPN. The tracking ID is the only trusted input: it is verified with Pesapal,
 * then resolved to the order that stored it at checkout. All money movement happens in
 * one database transaction (settle_order_payment), which is idempotent on replays.
 */
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const trackingId = url.searchParams.get("OrderTrackingId");
  const merchantRef = url.searchParams.get("OrderMerchantReference");
  if (!trackingId) return new Response("Missing parameters", { status: 400 });

  try {
    const token = await getPesapalToken();
    const statusRes = await fetch(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,
      { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } },
    );
    const s = await statusRes.json();
    const status = s.payment_status_description as string | undefined;

    // Pesapal echoes our order id as merchant_reference; reject mismatches.
    if (merchantRef && s.merchant_reference && s.merchant_reference !== merchantRef) {
      console.warn("IPN reference mismatch", { trackingId, merchantRef });
      return new Response("Reference mismatch", { status: 400 });
    }

    if (status === "Completed" || status === "Failed" || status === "Invalid") {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await admin.rpc("settle_order_payment", {
        _tracking_id: trackingId,
        _paid: status === "Completed",
      });
      if (error) throw error;
      console.log("IPN settled", trackingId, status, data);
    }

    return new Response(
      JSON.stringify({ orderNotificationType: "IPNCHANGE", orderTrackingId: trackingId, orderMerchantReference: merchantRef, status: 200 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("pesapal-ipn error:", err);
    return new Response("Error", { status: 500 });
  }
});
