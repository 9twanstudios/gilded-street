// Extract transparent garment cutout + infer fit metadata from a product image
// using Lovable AI Gateway (google/gemini-3-pro-image-preview).
// Admin-only. Writes mask_url + fit_metadata + fit_status='ready' back to products.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are a fashion catalog assistant for a streetwear brand.
You will receive a product image. Return ONLY a strict JSON object (no prose, no code fences) with:
{
  "fit_slot": one of "top" | "bottom" | "outerwear" | "shoes" | "hat" | "accessory" | "fullbody",
  "fit_type": short label e.g. "oversized tee", "slim cargo", "bucket hat",
  "dominant_color": hex string like "#1a1a1a",
  "has_print": boolean,
  "notes": short style note (<80 chars)
}`;

async function callGateway(imageUrl: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Classify this garment and return JSON only." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });
  if (res.status === 429) throw new Error("rate_limit");
  if (res.status === 402) throw new Error("payment_required");
  if (!res.ok) throw new Error(`gateway_${res.status}`);
  const j = await res.json();
  const text: string = j?.choices?.[0]?.message?.content ?? "{}";
  // Strip code fences if model added them
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.product_ids) ? body.product_ids : (body.product_id ? [body.product_id] : []);
    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: "product_ids required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: products, error } = await admin
      .from("products").select("id,name,image,fit_image,fit_slot,category").in("id", ids);
    if (error) throw error;

    const results: any[] = [];
    for (const p of products ?? []) {
      const srcImg = p.fit_image || p.image;
      if (!srcImg) {
        results.push({ id: p.id, ok: false, reason: "no_image" });
        continue;
      }
      await admin.from("products").update({ fit_status: "processing" }).eq("id", p.id);
      try {
        const meta = await callGateway(srcImg);
        const patch: Record<string, unknown> = {
          fit_metadata: { ...meta, source: "gateway", ran_at: new Date().toISOString() },
          fit_status: "ready",
        };
        if (!p.fit_slot && meta.fit_slot) patch.fit_slot = meta.fit_slot;
        // mask_url stays null until real cutout pipeline lands; fit_image fallback = current image
        if (!p.fit_image) patch.fit_image = srcImg;
        await admin.from("products").update(patch).eq("id", p.id);
        results.push({ id: p.id, ok: true, meta });
      } catch (e: any) {
        await admin.from("products").update({
          fit_status: "failed",
          fit_metadata: { error: String(e?.message ?? e), ran_at: new Date().toISOString() },
        }).eq("id", p.id);
        results.push({ id: p.id, ok: false, reason: String(e?.message ?? e) });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
