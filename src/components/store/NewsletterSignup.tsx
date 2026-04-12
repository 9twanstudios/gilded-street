import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    setLoading(false);
    if (error?.code === "23505") {
      toast.info("You're already subscribed!");
      setDone(true);
    } else if (error) {
      toast.error("Something went wrong.");
    } else {
      toast.success("Welcome to the movement! 🔥");
      setDone(true);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 text-center">
      <h3 className="font-heading text-2xl text-gold-gradient mb-1">Join the Movement</h3>
      <p className="text-muted-foreground text-sm mb-4">Drops, restocks & exclusive deals — straight to your inbox.</p>
      {done ? (
        <p className="text-neon font-display font-bold text-sm">✓ You're in. Watch your inbox.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-surface border-border text-foreground text-sm"
          />
          <Button type="submit" disabled={loading} size="sm" className="bg-neon text-neon-foreground font-display font-bold uppercase text-xs shrink-0 hover:bg-neon/90">
            {loading ? "..." : "Subscribe"}
          </Button>
        </form>
      )}
    </div>
  );
}
