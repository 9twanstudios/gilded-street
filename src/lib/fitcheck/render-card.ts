import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";

export async function renderAndUploadFitCover(node: HTMLElement, userId: string, fitId: string): Promise<string | null> {
  try {
    const canvas = await html2canvas(node, { backgroundColor: "#0a0a0a", useCORS: true, scale: 1.5 });
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas->blob failed"))), "image/png", 0.9)
    );
    const path = `fits/${userId}/${fitId}.png`;
    const { error } = await supabase.storage.from("product-images").upload(path, blob, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error("[fitcheck] render failed", e);
    return null;
  }
}
