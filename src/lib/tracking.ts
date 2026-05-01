/**
 * LDX v12 event tracking — persists to Supabase `events` table.
 * Fire-and-forget, never blocks UI. Adds session id + page path automatically.
 */
import { supabase } from "@/integrations/supabase/client";

type TrackingEvent =
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "payment_completed"
  | "purchase_completed"
  | "order_fulfilled"
  | "drop_view"
  | "drop_opened"
  | "story_view"
  | "page_view"
  | "qr_scanned"
  | "cluster_view"
  | "local_view";

interface TrackingPayload {
  [key: string]: unknown;
}

const SESSION_KEY = "91fitz_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

async function dispatch(event: TrackingEvent, properties: TrackingPayload) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const path = typeof window !== "undefined" ? window.location.pathname : null;
    await supabase.from("events" as any).insert({
      event_type: event,
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      page_path: path,
      properties: properties as any,
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[track] failed", event, err);
  }
  if (import.meta.env.DEV) console.log(`[91Fitz Track] ${event}`, properties);
}

export const track = {
  productView: (productId: string, dropId?: string) => dispatch("product_view", { productId, dropId }),
  addToCart: (productId: string, size: string, price: number) => dispatch("add_to_cart", { productId, size, price }),
  checkoutStarted: (orderId: string, total: number) => dispatch("checkout_started", { orderId, total }),
  paymentCompleted: (orderId: string, total: number) => dispatch("payment_completed", { orderId, total }),
  purchaseCompleted: (orderId: string, total: number, itemCount: number) =>
    dispatch("purchase_completed", { orderId, total, itemCount }),
  dropView: (dropId: string, slug: string) => dispatch("drop_view", { dropId, slug }),
  storyView: (storyId: string, slug: string) => dispatch("story_view", { storyId, slug }),
  pageView: (path: string) => dispatch("page_view", { path }),
  qrScanned: (campaignId: string, slug: string) => dispatch("qr_scanned", { campaignId, slug }),
  clusterView: (slug: string) => dispatch("cluster_view", { slug }),
  localView: (slug: string) => dispatch("local_view", { slug }),
};
