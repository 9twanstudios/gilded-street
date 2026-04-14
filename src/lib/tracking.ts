/**
 * LionByte-ready event tracking system.
 * Currently logs to console. Replace the `dispatch` function
 * body with an API call when LionByte integration is ready.
 */

type TrackingEvent =
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase_completed"
  | "drop_view"
  | "story_view"
  | "page_view";

interface TrackingPayload {
  [key: string]: unknown;
}

const TRACKING_ENABLED = true;

function dispatch(event: TrackingEvent, properties: TrackingPayload) {
  if (!TRACKING_ENABLED) return;

  // --- Future LionByte integration point ---
  // await fetch('https://api.lionbyte.io/events', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'X-API-Key': LIONBYTE_KEY },
  //   body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
  // });

  if (import.meta.env.DEV) {
    console.log(`[91Fitz Track] ${event}`, properties);
  }
}

export const track = {
  productView: (productId: string, dropId?: string) =>
    dispatch("product_view", { productId, dropId }),

  addToCart: (productId: string, size: string, price: number) =>
    dispatch("add_to_cart", { productId, size, price }),

  checkoutStarted: (orderId: string, total: number) =>
    dispatch("checkout_started", { orderId, total }),

  purchaseCompleted: (orderId: string, total: number, itemCount: number) =>
    dispatch("purchase_completed", { orderId, total, itemCount }),

  dropView: (dropId: string, slug: string) =>
    dispatch("drop_view", { dropId, slug }),

  storyView: (storyId: string, slug: string) =>
    dispatch("story_view", { storyId, slug }),

  pageView: (path: string) =>
    dispatch("page_view", { path }),
};
