import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile, useCompleteOnboarding } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { ChipPicker } from "@/components/profile/ChipPicker";
import SEO from "@/components/SEO";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const complete = useCompleteOnboarding();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? profile.full_name ?? "");
      setBio(profile.bio ?? "");
      setCity(profile.location_city ?? "");
      setInterests(profile.interests ?? []);
      setPhone(profile.phone ?? "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  if (!loading && !user) { navigate("/auth/sign-in?next=/onboarding/welcome"); return null; }

  async function save() {
    await update.mutateAsync({ display_name: displayName, bio, location_city: city, interests, phone, avatar_url: avatarUrl });
    await complete.mutateAsync();
    const next = params.get("next") || "/account/profile";
    navigate(next);
  }
  async function skip() {
    await complete.mutateAsync();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <SEO title="Welcome to 91Fitz" description="Set up your profile in 60 seconds." noindex />
      <div className="container max-w-2xl">
        <h1 className="font-heading text-5xl text-gold-gradient mb-2">Welcome to the Uniform</h1>
        <p className="text-muted-foreground text-sm mb-8">Pan-African streetwear. Tell us who you are — takes 60 seconds.</p>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-4">
            {user && <ImageUpload userId={user.id} kind="avatar" url={avatarUrl} onUploaded={setAvatarUrl} />}
            <div className="flex-1">
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your public name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi" />
            </div>
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">WhatsApp / Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254…" />
            </div>
          </div>

          <div>
            <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="A line about your style." />
          </div>

          <ChipPicker label="Style interests" value={interests} onChange={setInterests} />

          <div className="flex gap-3 pt-2">
            <Button onClick={save} disabled={update.isPending || complete.isPending} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider">
              Save & continue
            </Button>
            <Button onClick={skip} variant="outline" className="border-border text-muted-foreground">Skip for now</Button>
            <Button asChild variant="ghost" className="ml-auto text-primary"><a href="/onboarding/creator">Apply as creator →</a></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
