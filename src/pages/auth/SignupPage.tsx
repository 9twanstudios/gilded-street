import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, ShoppingBag, Palette } from "lucide-react";

type AccountType = "buyer" | "creator";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === "creator" && !brandName.trim()) {
      toast.error("Brand name is required for creators");
      return;
    }
    setLoading(true);
    const { data: signupData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const userId = signupData.user?.id;
    if (userId && accountType === "creator") {
      await supabase.from("creators").insert({
        user_id: userId,
        brand_name: brandName.trim(),
      });
    }

    // LDX v14: attach referral if a code is stored
    if (userId) {
      try {
        const { getStoredReferralCode } = await import("@/pages/store/ReferralCapturePage");
        const code = getStoredReferralCode();
        if (code) {
          const { data: refProfile } = await supabase.from("profiles").select("id").eq("referral_code", code).maybeSingle();
          if (refProfile && (refProfile as any).id !== userId) {
            await supabase.from("referrals" as any).insert({
              referrer_id: (refProfile as any).id,
              invitee_id: userId,
              code,
              status: "signed_up",
            });
          }
        }
      } catch {}
    }

    setLoading(false);
    toast.success("Account created! Check your email to confirm.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-heading text-5xl text-gold-gradient tracking-wider">91FITZ</span>
          </Link>
          <p className="text-muted-foreground mt-2 font-display uppercase tracking-wider text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="bg-card border border-border rounded-lg p-8 space-y-5">
          {/* Account Type Selection */}
          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider mb-3 block">I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("buyer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                  accountType === "buyer"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <ShoppingBag className="h-6 w-6" />
                <span className="font-display font-bold text-sm uppercase tracking-wider">Buyer</span>
                <span className="text-xs opacity-70">Shop streetwear</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("creator")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                  accountType === "creator"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Palette className="h-6 w-6" />
                <span className="font-display font-bold text-sm uppercase tracking-wider">Creator</span>
                <span className="text-xs opacity-70">Sell your merch</span>
              </button>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Full Name</Label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="John Doe"
            />
          </div>

          {accountType === "creator" && (
            <div>
              <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Brand Name</Label>
              <Input
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="bg-input border-border text-foreground focus:border-primary mt-1"
                placeholder="Your brand name"
              />
            </div>
          )}

          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Phone</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="0712345678"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold hover:shadow-gold-lg transition-all duration-300"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {loading ? "Creating..." : accountType === "creator" ? "Create Creator Account" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
