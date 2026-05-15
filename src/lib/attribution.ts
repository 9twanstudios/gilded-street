/**
 * INSIGHT LDX v1.1 attribution capture — UTM params, ref code, qr slug,
 * plus referrer-based traffic source classification (organic / ai_search /
 * social / affiliate / paid / direct). Persists 30d in localStorage and
 * is read at order creation to populate orders.attribution + the new
 * orders.traffic_source / seo_landing_page / search_query columns.
 */
const KEY = "ldx_attr_v1";
const MAX_AGE_DAYS = 30;

export type TrafficSource =
  | "organic"
  | "ai_search"
  | "social"
  | "affiliate"
  | "paid"
  | "direct";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
  qr_slug?: string;
  landing?: string;
  referrer?: string;
  traffic_source?: TrafficSource;
  ai_source?: string;       // chatgpt | perplexity | claude | gemini | copilot
  search_engine?: string;   // google | bing | duckduckgo | yandex
  social_network?: string;  // tiktok | instagram | x | facebook | youtube ...
  search_query?: string;
  captured_at?: string;
}

const AI_HOSTS: Record<string, string> = {
  "chat.openai.com": "chatgpt",
  "chatgpt.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "claude.ai": "claude",
  "gemini.google.com": "gemini",
  "bard.google.com": "gemini",
  "copilot.microsoft.com": "copilot",
  "you.com": "you",
  "phind.com": "phind",
};

const SEARCH_HOSTS: Record<string, string> = {
  "google.": "google",
  "bing.com": "bing",
  "duckduckgo.com": "duckduckgo",
  "yandex.": "yandex",
  "baidu.com": "baidu",
  "ecosia.org": "ecosia",
  "brave.com": "brave",
};

const SOCIAL_HOSTS: Record<string, string> = {
  "tiktok.com": "tiktok",
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "x.com": "x",
  "twitter.com": "x",
  "t.co": "x",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "linkedin.com": "linkedin",
  "pinterest.com": "pinterest",
  "reddit.com": "reddit",
  "snapchat.com": "snapchat",
  "wa.me": "whatsapp",
  "whatsapp.com": "whatsapp",
  "t.me": "telegram",
};

function classifyReferrer(ref: string, params: URLSearchParams): {
  traffic_source: TrafficSource;
  ai_source?: string;
  search_engine?: string;
  social_network?: string;
} {
  // Paid takes precedence: gclid / fbclid / msclkid / utm_medium=cpc
  if (
    params.get("gclid") ||
    params.get("fbclid") ||
    params.get("msclkid") ||
    /cpc|paid|ppc/i.test(params.get("utm_medium") || "")
  ) {
    return { traffic_source: "paid" };
  }
  if (params.get("ref") || /affiliate|partner/i.test(params.get("utm_medium") || "")) {
    return { traffic_source: "affiliate" };
  }
  if (!ref) return { traffic_source: "direct" };
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase(); } catch { return { traffic_source: "direct" }; }

  for (const [key, name] of Object.entries(AI_HOSTS)) {
    if (host === key || host.endsWith("." + key)) return { traffic_source: "ai_search", ai_source: name };
  }
  for (const [key, name] of Object.entries(SEARCH_HOSTS)) {
    if (host.includes(key)) return { traffic_source: "organic", search_engine: name };
  }
  for (const [key, name] of Object.entries(SOCIAL_HOSTS)) {
    if (host === key || host.endsWith("." + key)) return { traffic_source: "social", social_network: name };
  }
  // unknown external referrer → treat as social-ish "other"
  return { traffic_source: "social", social_network: host };
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
  const q = params.get("q") || params.get("query");
  if (q) incoming.search_query = q;

  try {
    const stored = localStorage.getItem("ldx_ref");
    if (stored) incoming.ref = stored;
  } catch {}
  const m = document.cookie.match(/(?:^|; )ldx_ref=([^;]+)/);
  if (m && !incoming.ref) incoming.ref = decodeURIComponent(m[1]);

  const ref = document.referrer || "";
  const sameOrigin = ref && (() => { try { return new URL(ref).hostname === window.location.hostname; } catch { return false; } })();

  // Only classify when this is a fresh landing (no stored attribution OR external referrer)
  const existing = readAttribution();
  if (!existing.traffic_source || (ref && !sameOrigin)) {
    const cls = classifyReferrer(sameOrigin ? "" : ref, params);
    Object.assign(incoming, cls);
    if (ref && !sameOrigin) incoming.referrer = ref;
  }

  if (Object.keys(incoming).length === 0) return existing;

  incoming.landing = incoming.landing || url.pathname;
  incoming.captured_at = new Date().toISOString();

  try {
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
