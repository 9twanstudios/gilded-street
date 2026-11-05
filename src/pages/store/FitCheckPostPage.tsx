import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { useCreateLook } from "@/hooks/use-fitcheck";

const ESTATES = ["Kilimani", "Kariobangi", "Kibera", "South B", "South C", "Eastleigh", "Mathare", "Dandora", "Umoja", "Westlands"];

/** Studio → Post a Look. Upload 9:16 media, tag the merch, publish to the FitCheck feed. */
export default function FitCheckPostPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: products } = useProducts();
  const createLook = useCreateLook();

  const [coverImage, setCoverImage] = useState("");
  const [caption, setCaption] = useState("");
  const [estate, setEstate] = useState("");
  const [vibe, setVibe] = useState("");
  const [tagged, setTagged] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) navigate("/auth/sign-in?next=/fitcheck/post", { replace: true });
  }, [loading, user, navigate]);

  const approved = useMemo(() => (products ?? []).filter((p) => p.approved), [products]);
  const valid = coverImage && caption.trim().length > 0;

  const submit = async () => {
    if (!valid) return;
    try {
      await createLook.mutateAsync({
        cover_image: coverImage,
        caption: caption.trim(),
        estate: estate || undefined,
        vibe: vibe || undefined,
        product_ids: [...tagged],
      });
      navigate("/fitcheck");
    } catch {
      /* toast surfaces the error */
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-24">
      <SEO title="Post a Look" description="Post your fit to FitCheck — tag the merch you're wearing and get discovered." noindex />
      <h1 className="py-6 font-display text-3xl font-bold uppercase tracking-widest text-primary">Post a Look</h1>

      <div className="space-y-5">
        <div>
          <Label htmlFor="look-media">Your fit (9:16 works best)</Label>
          <div className="mt-2">
            <MediaUploader value={coverImage} onChange={setCoverImage} folder="fits" label="Upload your fit" />
          </div>
        </div>

        <div>
          <Label htmlFor="look-caption">Caption</Label>
          <Input
            id="look-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 120))}
            placeholder="What's the fit saying?"
            maxLength={120}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="look-estate">Estate</Label>
            <Input id="look-estate" list="estates" value={estate} onChange={(e) => setEstate(e.target.value.slice(0, 40))} placeholder="Kilimani" className="mt-2" maxLength={40} />
            <datalist id="estates">{ESTATES.map((e) => <option key={e} value={e} />)}</datalist>
          </div>
          <div>
            <Label htmlFor="look-vibe">Vibe</Label>
            <Input id="look-vibe" value={vibe} onChange={(e) => setVibe(e.target.value.slice(0, 40))} placeholder="Rebel, clean, loud…" className="mt-2" maxLength={40} />
          </div>
        </div>

        <div>
          <Label>Tag the merch you're wearing</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {approved.map((p) => {
              const on = tagged.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTagged((s) => { const n = new Set(s); on ? n.delete(p.id) : n.add(p.id); return n; })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={submit} disabled={!valid || createLook.isPending} className="w-full font-display uppercase tracking-widest">
          {createLook.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Post to FitCheck"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Community looks are public. Tagged pieces link straight to your shop.</p>
      </div>
    </div>
  );
}
