import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/** Single upload path for every image in the app (products, drop covers, creator assets). */
export async function uploadImage(file: File, folder = "media"): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Use a JPG, PNG or WebP image");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 5 MB");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to upload");
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${user.id}/${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function MediaUploader({ value, onChange, folder, label = "Upload image" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files?.[0]); }}
      className={`relative rounded-lg border-2 border-dashed p-3 transition-colors ${drag ? "border-primary bg-primary/5" : "border-border"}`}
    >
      {value ? (
        <div className="relative">
          <img src={value} alt="Uploaded preview" className="h-40 w-full rounded object-cover" />
          <Button type="button" size="icon" variant="secondary" aria-label="Remove image" className="absolute right-2 top-2 h-7 w-7" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="flex h-32 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          <span>{busy ? "Uploading…" : `${label} — drag & drop or tap`}</span>
          <span className="text-xs">JPG, PNG, WebP · max 5 MB</span>
        </button>
      )}
      <input ref={input} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
