import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for the reset link.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-heading text-5xl text-gold-gradient tracking-wider">91FITZ</span>
          </Link>
          <p className="text-muted-foreground mt-2 font-display uppercase tracking-wider text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-foreground font-display font-bold">Check your email</p>
            <p className="text-muted-foreground text-sm mt-2">We sent a password reset link to {email}</p>
            <Link to="/auth/sign-in" className="text-primary hover:underline text-sm mt-4 inline-block">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-card border border-border rounded-lg p-8 space-y-5">
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm">
              <Link to="/auth/sign-in" className="text-muted-foreground hover:text-primary transition-colors">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
