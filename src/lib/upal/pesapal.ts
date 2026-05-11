import { supabase } from "@/integrations/supabase/client";
import type { PaymentProvider, CheckoutRequest, CheckoutResponse } from "./types";

export const pesapalProvider: PaymentProvider = {
  id: "pesapal",
  async createCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    const { data, error } = await supabase.functions.invoke("pesapal-checkout", {
      body: { order_id: req.orderId, callback_url: req.callbackUrl },
    });
    if (error) throw new Error(error.message || "Pesapal checkout failed");
    if (data?.error) throw new Error(data.error);
    return { redirectUrl: data.redirect_url, externalRef: data.tracking_id ?? "" };
  },
  parseIpn(query) {
    return {
      orderId: query.get("OrderMerchantReference") ?? "",
      externalRef: query.get("OrderTrackingId") ?? "",
    };
  },
};
