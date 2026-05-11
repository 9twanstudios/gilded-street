/**
 * LDX v14 attribution capture — reads UTM params, ref code, qr slug from URL
 * and persists for 30d. Read at order creation to populate orders.attribution.
 */
const KEY = "ldx_attr_v1";
const MAX_AGE_DAYS = 30;

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;            // referral code
  qr_slug?: string;        // qr campaign slug
  landing?: string;        // first landing path
  captured_at?: string;
}

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const incoming: Attribution = {};

  for (const k of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"] as const) {
    const v = params.get(k);
    if (v) incoming[k] = v;
  }
  const qr = params.get("qr");
  if (qr) incoming.qr_slug = qr;

  // referral cookie set by /r/:code
  try {
    const stored = localStorage.getItem("ldx_ref");
    if (stored) incoming.ref = stored;
  } catch {}
  const m = document.cookie.match(/(?:^|; )ldx_ref=([^;]+)/);
  if (m && !incoming.ref) incoming.ref = decodeURIComponent(m[1]);

  if (Object.keys(incoming).length === 0) return readAttribution();

  incoming.landing = url.pathname;
  incoming.captured_at = new Date().toISOString();

  try {
    const existing = readAttribution();
    const merged = { ...existing, ...incoming };
    localStorage.setItem(KEY, JSON.stringify({ data: merged, exp: Date.now() + MAX_AGE_DAYS * 86400000 }));
    return merged;
  } catch {
    return incoming;
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed.exp && parsed.exp < Date.now()) {
      localStorage.removeItem(KEY);
      return {};
    }
    return parsed.data || {};
  } catch {
    return {};
  }
}

export function clearAttribution() {
  try { localStorage.removeItem(KEY); } catch {}
}
