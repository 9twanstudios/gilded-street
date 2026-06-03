import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SEO from "@/components/SEO";
import { toast } from "sonner";

export default function CreatorApplicationPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [samples, setSamples] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && !user) { navigate("/auth/sign-in?next=/onboarding/creator"); return null; }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("creator_applications" as any).insert({
        user_id: user.id,
        brand_name: brand,
        bio,
        socials: { instagram, tiktok },
        sample_urls: samples.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      if (error) throw error;
      toast.success("Application submitted. We'll review within 48h.");
      navigate("/account/profile");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <SEO title="Become a Creator | 91Fitz" description="Join the 91Fitz creator economy. 90/10 split, immutable ledger, Pan-African reach." noindex />
      <div className="container max-w-2xl">
        <h1 className="font-heading text-5xl text-gold-gradient mb-2">Become a Creator</h1>
        <p className="text-muted-foreground text-sm mb-8">90/10 split. Your drops, your story, our platform.</p>

        <form onSubmit={submit} className="bg-card border border-border rounded-lg p-6 space-y-5">
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Brand Name *</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Brand Bio *</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Instagram</label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" />
            </div>
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">TikTok</label>
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@handle" />
            </div>
          </div>
          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Sample work URLs (one per line)</label>
            <Textarea value={samples} onChange={(e) => setSamples(e.target.value)} rows={3} placeholder="https://…" />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider">
            {busy ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </div>
    </div>
  );
}
