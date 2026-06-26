// Fitcheck AI compositor — takes layered fit items + body type + environment,
// asks Gemini image model to produce a styled editorial render, uploads to
// the `fits` storage bucket, returns the public URL.
//
// Auth: requires bearer token (signed-in user). Output is uploaded to that user's folder.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

type FitItem = {
  product_id: string;
  slot: string;
  image: string;
  name: string;
};

type Body = {
  fit_id: string;
  model: "male" | "female";
  body_type: "slim" | "regular" | "athletic" | "curvy";
  environment: "studio" | "street" | "sunset" | "club" | "rooftop";
  items: FitItem[];
};

const ENV_PROMPT: Record<Body["environment"], string> = {
  studio: "soft seamless studio backdrop, warm fashion-editorial lighting",
  street: "moody urban Nairobi street at night, neon reflections on wet asphalt",
  sunset: "golden-hour rooftop with warm sunset glow and lens flare",
  club: "high-contrast nightclub with magenta and violet stage lights, light haze",
  rooftop: "downtown rooftop at blue hour, distant skyline bokeh",
};

const BODY_PROMPT: Record<Body["body_type"], string> = {
  slim: "slim athletic build",
  regular: "regular average proportions",
  athletic: "muscular athletic V-shape build",
  curvy: "curvy hourglass build",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const body = (await req.json()) as Body;
    if (!body?.fit_id || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "fit_id and items required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const garments = body.items
      .map((it, i) => `  ${i + 1}. ${it.slot}: ${it.name} (reference image ${i + 1})`)
      .join("\n");

    const prompt = `Editorial fashion photograph, full-body, ${body.model === "male" ? "male" : "female"} model, ${BODY_PROMPT[body.body_type]}, neutral pose, looking confidently at camera. Wearing exactly these garments composed coherently as one outfit:
${garments}

Setting: ${ENV_PROMPT[body.environment]}.
Style: high-end streetwear lookbook, 50mm, shallow depth of field, crisp focus on garments, accurate colors and textures matching the reference images, no extra accessories, no logos other than those in the references, no text or watermark. Square 1:1 aspect.`;

    // Gemini image model — multimodal: text prompt + each garment image as a reference.
    const content: any[] = [{ type: "text", text: prompt }];
    for (const it of body.items.slice(0, 6)) {
      content.push({ type: "image_url", image_url: { url: it.image } });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 502;
      return new Response(JSON.stringify({ error: "Render failed", detail: errText.slice(0, 500) }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    // OpenRouter chat-completions image shape: choices[0].message.images[0].image_url.url (data URL)
    const dataUrl: string | undefined =
      aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
      aiJson?.choices?.[0]?.message?.content?.find?.((p: any) => p?.image_url)?.image_url?.url;

    if (!dataUrl || !dataUrl.startsWith("data:")) {
      return new Response(JSON.stringify({ error: "Model returned no image" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [meta, b64] = dataUrl.split(",");
    const mime = meta.match(/data:([^;]+)/)?.[1] || "image/png";
    const ext = mime.includes("jpeg") ? "jpg" : "png";
    const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const path = `${userId}/renders/${body.fit_id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("fits")
      .upload(path, binary, { contentType: mime, upsert: true });
    if (upErr) {
      return new Response(JSON.stringify({ error: "Upload failed", detail: upErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = supabase.storage.from("fits").getPublicUrl(path);
    const render_url = pub.publicUrl;

    // Persist render_url on the fit. RLS lets owner update their own row.
    await supabase.from("fits").update({ render_url }).eq("id", body.fit_id).eq("user_id", userId);

    return new Response(JSON.stringify({ render_url }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(e).slice(0, 300) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
