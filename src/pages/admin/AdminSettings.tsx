import { useState } from "react";
import { usePlatformSettings } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Percent } from "lucide-react";

export default function AdminSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const queryClient = useQueryClient();
  const [commissionRate, setCommissionRate] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const currentRate = settings?.commission_rate ?? "10";

  const handleSave = async () => {
    const rate = parseInt(commissionRate || currentRate, 10);
    if (isNaN(rate) || rate < 1 || rate > 50) {
      toast.error("Commission rate must be between 1% and 50%");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ value: rate.toString() })
      .eq("key", "commission_rate");
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Commission rate updated to ${rate}%`);
    queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
    setCommissionRate("");
  };

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Platform Settings</h1>

      <div className="bg-card border border-border rounded-lg p-6 max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Percent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Commission Rate</h2>
            <p className="text-muted-foreground text-xs">Platform fee charged on each creator sale</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground text-xs font-display uppercase tracking-wider">
              Current Rate: <span className="text-primary font-bold">{isLoading ? "..." : currentRate}%</span>
            </Label>
          </div>

          <div className="flex gap-3">
            <Input
              type="number"
              min={1}
              max={50}
              placeholder={currentRate}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="bg-background border-border w-24"
            />
            <span className="text-muted-foreground self-center">%</span>
            <Button
              onClick={handleSave}
              disabled={saving || !commissionRate}
              className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90"
            >
              {saving ? "Saving..." : "Update"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This rate applies to all new orders. Creator receives {100 - parseInt(commissionRate || currentRate, 10)}% of sale price.
          </p>
        </div>
      </div>
    </div>
  );
}
