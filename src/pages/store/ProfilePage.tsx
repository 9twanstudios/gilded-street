import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useWishlist } from "@/hooks/use-wishlist";
import { useWallet, useLedger } from "@/hooks/use-wallet";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { formatKES, formatDate } from "@/lib/format";
import { Package, Heart, LogOut, Wallet, User as UserIcon, Edit3, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/store/ProductCard";
import { SocialLinks, SocialHandles } from "@/components/profile/SocialLinks";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { ChipPicker } from "@/components/profile/ChipPicker";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "overview" | "edit" | "orders" | "wishlist" | "wallet" | "referrals" | "security";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { data: orders } = useMyOrders(user?.id);
  const { data: wishlistItems } = useWishlist();
  const { data: wallet } = useWallet();
  const { data: ledger } = useLedger(user?.id);
  const [tab, setTab] = useState<Tab>("overview");

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [social, setSocial] = useState<SocialHandles>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? profile.full_name ?? "");
      setUsername(profile.username ?? "");
      setBio(profile.bio ?? "");
      setCity(profile.location_city ?? "");
      setPronouns(profile.pronouns ?? "");
      setSocial((profile.social as SocialHandles) ?? {});
      setInterests(profile.interests ?? []);
      setStyleTags(profile.style_tags ?? []);
      setAvatarUrl(profile.avatar_url);
      setCoverUrl(profile.cover_url);
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="container py-8">
        <SEO title="My Account | 91Fitz" noindex />
        <h1 className="font-heading text-5xl text-gold-gradient mb-8">My Account</h1>
        <div className="bg-card rounded-lg border border-border p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">Guest User</h3>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your account</p>
          <Button asChild className="mt-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: UserIcon },
    { key: "edit", label: "Edit", icon: Edit3 },
    { key: "orders", label: "Orders", icon: Package },
    { key: "wishlist", label: "Wishlist", icon: Heart },
    { key: "wallet", label: "Wallet", icon: Wallet },
    { key: "referrals", label: "Referrals", icon: Share2 },
    { key: "security", label: "Security", icon: Shield },
  ];

  async function saveEdit() {
    await update.mutateAsync({
      display_name: displayName, username: username || null, bio, location_city: city, pronouns,
      social: social as any, interests, style_tags: styleTags, avatar_url: avatarUrl, cover_url: coverUrl,
    });
    setTab("overview");
  }

  async function resetPassword() {
    if (!user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Password reset email sent");
  }

  return (
    <div className="container py-8">
      <SEO title="My Account | 91Fitz" noindex />
      {/* Cover + avatar */}
      <div className="relative mb-16">
        <div className="h-40 w-full rounded-lg overflow-hidden bg-surface border border-border">
          {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-surface">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon className="h-10 w-10 text-primary" /></div>}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 pl-6">
        <div>
          <h1 className="font-heading text-3xl text-foreground">{displayName || user.email}</h1>
          {username && <p className="text-muted-foreground text-sm">@{username}</p>}
          {bio && <p className="text-foreground text-sm mt-2 max-w-xl">{bio}</p>}
          <div className="mt-3"><SocialLinks socials={social} /></div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Wallet</p>
          <p className="text-primary font-heading text-2xl">{formatKES(wallet?.balance ?? 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3">Style Interests</h3>
            <div className="flex flex-wrap gap-2">{interests.length === 0 ? <p className="text-muted-foreground text-sm">None yet.</p> : interests.map(i => <span key={i} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-display uppercase tracking-wider">{i}</span>)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-3">Recent Orders</h3>
            {orders && orders.length > 0 ? <div className="space-y-2">{orders.slice(0, 3).map((o: any) => (
              <div key={o.id} className="flex justify-between text-sm"><span className="text-muted-foreground">{formatDate(o.created_at)}</span><span className="text-primary">{formatKES(o.total)}</span></div>
            ))}</div> : <p className="text-muted-foreground text-sm">No orders yet.</p>}
          </div>
        </div>
      )}

      {tab === "edit" && user && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-5 max-w-3xl">
          <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
            <ImageUpload userId={user.id} kind="avatar" url={avatarUrl} onUploaded={setAvatarUrl} />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Display Name</label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
                <div><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Username</label><Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} /></div>
              </div>
              <ImageUpload userId={user.id} kind="cover" url={coverUrl} onUploaded={setCoverUrl} aspect="wide" />
            </div>
          </div>
          <div><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Bio</label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">City</label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Pronouns</label><Input value={pronouns} onChange={(e) => setPronouns(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["instagram","tiktok","x","youtube","whatsapp","website"] as const).map(k => (
              <div key={k}><label className="text-xs font-display uppercase tracking-wider text-muted-foreground">{k}</label>
                <Input value={(social as any)[k] || ""} onChange={(e) => setSocial({ ...social, [k]: e.target.value })} placeholder={k === "whatsapp" ? "+254…" : "@handle"} /></div>
            ))}
          </div>
          <ChipPicker label="Interests" value={interests} onChange={setInterests} />
          <ChipPicker label="Style tags" value={styleTags} onChange={setStyleTags} />
          <Button onClick={saveEdit} disabled={update.isPending} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider">Save profile</Button>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-card border border-border rounded-lg p-6">
          {orders && orders.length > 0 ? <div className="space-y-3">{orders.map((o: any) => (
            <div key={o.id} className="flex justify-between items-center border-b border-border/50 pb-3">
              <div><p className="text-sm text-foreground font-medium">{o.id.slice(0, 8)}…</p><p className="text-xs text-muted-foreground">{formatDate(o.created_at)}</p></div>
              <div className="text-right"><p className="text-sm text-primary font-display font-bold">{formatKES(o.total)}</p><span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">{o.status}</span></div>
            </div>
          ))}</div> : <p className="text-muted-foreground text-sm">No orders yet.</p>}
        </div>
      )}

      {tab === "wishlist" && (
        wishlistItems && wishlistItems.length > 0 ?
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{wishlistItems.map((it: any, i: number) => it.products && <ProductCard key={it.id} product={it.products} index={i} />)}</div>
          : <div className="bg-card border border-border rounded-lg p-6 text-center"><Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">No saved items.</p></div>
      )}

      {tab === "wallet" && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Recent Transactions</h2>
            <Button asChild size="sm" variant="outline" className="border-primary text-primary"><Link to="/account/wallet">View All</Link></Button>
          </div>
          {ledger && ledger.length > 0 ? <div className="space-y-3">{ledger.slice(0, 8).map((e: any) => (
            <div key={e.id} className="flex justify-between items-center border-b border-border/50 pb-3">
              <div><p className="text-sm text-foreground font-medium capitalize">{e.type}</p><p className="text-xs text-muted-foreground">{e.description}</p></div>
              <div className="text-right"><p className={`text-sm font-display font-bold ${e.type === "deposit" || e.type === "refund" ? "text-success" : "text-destructive"}`}>{formatKES(e.amount)}</p><span className="text-xs text-muted-foreground">{e.status}</span></div>
            </div>
          ))}</div> : <p className="text-muted-foreground text-sm">No transactions yet.</p>}
        </div>
      )}

      {tab === "referrals" && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Your referral code</h2>
          <div className="flex items-center gap-3">
            <code className="px-4 py-2 rounded bg-surface text-primary font-mono text-xl tracking-wider border border-primary/30">{profile?.referral_code || "—"}</code>
            <Button variant="outline" size="sm" className="border-primary text-primary" onClick={() => {
              navigator.clipboard.writeText(`${location.origin}/r/${profile?.referral_code}`);
              toast.success("Referral link copied");
            }}>Copy link</Button>
          </div>
          <p className="text-xs text-muted-foreground">Share your code. Both you and your friend earn wallet credit when they purchase.</p>
        </div>
      )}

      {tab === "security" && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-2">Password</h2>
            <Button variant="outline" onClick={resetPassword} className="border-primary text-primary">Send reset email</Button>
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="outline" onClick={signOut} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
