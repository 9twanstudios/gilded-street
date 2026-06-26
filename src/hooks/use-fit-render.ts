import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FitItem, BodyType, Environment } from "@/hooks/use-fits";

interface RenderInput {
  fit_id: string;
  model: "male" | "female";
  body_type: BodyType;
  environment: Environment;
  items: FitItem[];
}

export function useFitRender() {
  const [loading, setLoading] = useState(false);
  const [renderUrl, setRenderUrl] = useState<string | null>(null);

  const render = async (input: RenderInput): Promise<string | null> => {
    if (!input.fit_id) {
      toast.error("Save the fit first, then generate an AI render.");
      return null;
    }
    if (input.items.length === 0) {
      toast.error("Add some garments first.");
      return null;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fitcheck-render", { body: input });
      if (error) throw error;
      const url = (data as any)?.render_url as string | undefined;
      if (!url) throw new Error("No render returned");
      setRenderUrl(url);
      toast.success("AI render ready");
      return url;
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("429")) toast.error("Rate limited — try again in a moment.");
      else if (msg.includes("402")) toast.error("AI credits exhausted. Add credits in Settings.");
      else toast.error("AI render failed", { description: msg.slice(0, 120) });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { render, loading, renderUrl, setRenderUrl };
}
