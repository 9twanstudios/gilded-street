// Server-only Wulfzzbyte Business OS client. Never import from browser code.
const BASE = (Deno.env.get("WULFZZBYTE_API_BASE_URL") ?? "").replace(/\/+$/, "");
const KEY = Deno.env.get("WULFZZBYTE_SITE_API_KEY") ?? "";

export const wulfzzConfigured = () => Boolean(BASE && KEY);

export async function wulfzz<T = any>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {},
): Promise<{ ok: boolean; status: number; data: T | any }> {
  const method = init.method ?? "GET";
  const headers: Record<string, string> = { Authorization: `Bearer ${KEY}`, Accept: "application/json" };
  if (method !== "GET") {
    if (!init.idempotencyKey) throw new Error("Idempotency-Key required for mutating Wulfzzbyte calls");
    headers["Idempotency-Key"] = init.idempotencyKey;
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(15000),
  });
  let data: any = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}
