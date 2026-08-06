import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { path, data_base64 } = await req.json();
    if (!path || !data_base64) throw new Error("path and data_base64 required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const bin = Uint8Array.from(atob(data_base64), (c) => c.charCodeAt(0));
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, bin, { contentType: "image/png", upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return new Response(JSON.stringify({ url: data.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
