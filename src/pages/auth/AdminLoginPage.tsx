import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr || !data.user) {
      setLoading(false);
      setError(signInErr?.message ?? "Sign-in failed");
      return;
    }

    // Verify admin role server-side via RLS-protected user_roles table
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const isAdmin = roles?.some((r) => r.role === "admin") ?? false;

    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This account does not have admin access.");
      return;
    }

    setLoading(false);
    toast.success("Welcome to ACP");
    navigate(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-heading text-5xl text-gold-gradient tracking-wider">91FITZ</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Lock className="h-4 w-4 text-primary" />
            <p className="text-primary font-display uppercase tracking-[0.3em] text-xs">ACP Access</p>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">Admin Control Plane — authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-primary/30 rounded-lg p-8 space-y-5 shadow-gold-lg">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
              <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Admin Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="admin@91fitz.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground focus:border-primary mt-1"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold hover:shadow-gold-lg transition-all duration-300"
          >
            <Lock className="mr-2 h-4 w-4" />
            {loading ? "Verifying..." : "Enter ACP"}
          </Button>

          <div className="text-center pt-2">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-xs font-display uppercase tracking-wider">
              ← Back to store
            </Link>
          </div>
        </form>

        <p className="text-center text-muted-foreground/60 text-[10px] font-display uppercase tracking-[0.2em] mt-6">
          All access attempts are logged
        </p>
      </div>
    </div>
  );
}
