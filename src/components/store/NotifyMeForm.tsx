import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotifyMeFormProps {
  productId: string;
}

export function NotifyMeForm({ productId }: NotifyMeFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("notify_requests").insert({ email: email.trim(), product_id: productId });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Try again.");
    } else {
      setDone(true);
      toast.success("We'll notify you when it's back in stock!");
    }
  };

  if (done) {
    return (
      <div className="bg-neon/10 border border-neon/30 rounded-lg p-4 text-center">
        <Bell className="h-5 w-5 text-neon mx-auto mb-1" />
        <p className="text-sm text-neon font-display font-bold">You're on the list!</p>
        <p className="text-xs text-muted-foreground">We'll email you when this restocks.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-primary" />
        <p className="text-sm font-display font-bold text-foreground uppercase tracking-wider">Sold Out — Get Notified</p>
      </div>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background border-border text-foreground text-sm"
        />
        <Button type="submit" disabled={loading} size="sm" className="bg-primary text-primary-foreground font-display font-bold uppercase text-xs shrink-0">
          {loading ? "..." : "Notify Me"}
        </Button>
      </div>
    </form>
  );
}
