export * from "./types";
export { pesapalProvider } from "./pesapal";
import { pesapalProvider } from "./pesapal";
import type { PaymentProvider } from "./types";

const providers: Record<string, PaymentProvider> = {
  pesapal: pesapalProvider,
};

export function getProvider(id: string = "pesapal"): PaymentProvider {
  const p = providers[id];
  if (!p) throw new Error(`Unknown payment provider: ${id}`);
  return p;
}
