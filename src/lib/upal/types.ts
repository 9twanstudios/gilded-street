/**
 * LDX v14 UPAL (Unified Payment Abstraction Layer) — provider-agnostic seam.
 * Wraps Pesapal today; adapters for additional providers slot into the same shape.
 */
export interface CheckoutRequest {
  orderId: string;
  amount: number;          // KES integer
  callbackUrl: string;
  customer: { email?: string; phone?: string; name?: string };
}

export interface CheckoutResponse {
  redirectUrl: string;
  externalRef: string;
}

export interface PaymentProvider {
  id: string;                  // "pesapal" | "stripe" | ...
  createCheckout(req: CheckoutRequest): Promise<CheckoutResponse>;
  /** Map provider IPN params → canonical { orderId, externalRef, status } */
  parseIpn(query: URLSearchParams): { orderId: string; externalRef: string };
}
