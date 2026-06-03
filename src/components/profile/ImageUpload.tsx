import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";

export function ImageUpload({
  userId,
  kind,
  url,
  onUploaded,
  aspect = "square",
}: {
  userId: string;
  kind: "avatar" | "cover";
  url?: string | null;
  onUploaded: (url: string) => void;
  aspect?: "square" | "wide";
}) {
  const [busy, setBusy] = useState(false);
  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `profiles/${userId}/${kind}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onUploaded(data.publicUrl);
      toast.success(`${kind === "avatar" ? "Avatar" : "Cover"} updated`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const isSquare = aspect === "square";
  return (
    <div className={`relative group ${isSquare ? "w-24 h-24 rounded-full" : "w-full h-40 rounded-lg"} bg-surface border border-border overflow-hidden`}>
      {url ? (
        <img src={url} alt={kind} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          {isSquare ? <Camera className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
        </div>
      )}
      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <span className="text-xs font-display uppercase tracking-wider text-primary">{busy ? "..." : "Change"}</span>
        <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={busy} />
      </label>
    </div>
  );
}
