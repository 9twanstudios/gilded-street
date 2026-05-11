import { useState } from "react";
import { usePlatformSettings } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Percent, TrendingUp, Gift } from "lucide-react";
import { logAdminAction } from "@/lib/admin-audit";
import { formatKES } from "@/hooks/use-wallet";

export default function AdminSettings() {
  const { data: settings, isLoading } = usePlatformSettings();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const platform = parseInt(settings?.commission_rate ?? "10", 10);
  const growth = parseInt(settings?.growth_pool_rate ?? "0", 10);
  const bounty = parseInt(settings?.referral_bounty ?? "10000", 10);

  const [platformInput, setPlatformInput] = useState<string>("");
  const [growthInput, setGrowthInput] = useState<string>("");
  const [bountyInput, setBountyInput] = useState<string>("");

  const newPlatform = platformInput === "" ? platform : parseInt(platformInput, 10);
  const newGrowth = growthInput === "" ? growth : parseInt(growthInput, 10);
  const creator = Math.max(0, 100 - newPlatform - newGrowth);

  async function saveOne(key: string, value: string, label: string) {
    setSaving(true);
    const { error } = await supabase.from("platform_settings").update({ value }).eq("key", key);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    logAdminAction("settings.updated", null, { key, value });
    toast.success(`${label} updated`);
    queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
  }

  async function saveSplits() {
    if (newPlatform + newGrowth > 100) { toast.error("Platform + Growth cannot exceed 100%"); return; }
    if (newPlatform < 0 || newGrowth < 0) { toast.error("Rates must be non-negative"); return; }
    await saveOne("commission_rate", String(newPlatform), "Platform fee");
    await saveOne("growth_pool_rate", String(newGrowth), "Growth pool");
    setPlatformInput(""); setGrowthInput("");
  }

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">Platform Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">LDX v14 monetisation engine</p>

      <div className="grid gap-6 max-w-2xl">
        <Card icon={Percent} title="Revenue Split" subtitle="Per-order distribution (must total ≤ 100%)">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Split label="Creator" value={`${creator}%`} accent />
            <Split label="Platform" value={`${newPlatform}%`} />
            <Split label="Growth Pool" value={`${newGrowth}%`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Platform fee %</Label>
              <Input type="number" min={0} max={100} placeholder={String(platform)} value={platformInput}
                onChange={(e) => setPlatformInput(e.target.value)} className="mt-1 bg-background" />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Growth pool %</Label>
              <Input type="number" min={0} max={100} placeholder={String(growth)} value={growthInput}
                onChange={(e) => setGrowthInput(e.target.value)} className="mt-1 bg-background" />
            </div>
          </div>
          <Button onClick={saveSplits} disabled={saving || isLoading}
            className="mt-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            {saving ? "Saving..." : "Update Splits"}
          </Button>
        </Card>

        <Card icon={Gift} title="Referral Bounty" subtitle={`Currently: ${formatKES(bounty)} per converted invitee`}>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs uppercase text-muted-foreground">Amount in KES cents</Label>
              <Input type="number" min={0} placeholder={String(bounty)} value={bountyInput}
                onChange={(e) => setBountyInput(e.target.value)} className="mt-1 bg-background" />
            </div>
            <Button onClick={() => bountyInput && saveOne("referral_bounty", bountyInput, "Referral bounty").then(() => setBountyInput(""))}
              disabled={saving || !bountyInput}
              className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              Update
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">e.g. 10000 = KES 100 paid to referrer when invitee's first order completes.</p>
        </Card>

        <Card icon={TrendingUp} title="Growth Pool" subtitle="Funds flow into the system fee bucket and back into referral bounties.">
          <p className="text-sm text-muted-foreground">
            Increase the growth pool % to accelerate viral acquisition. Decrease to maximise short-term platform revenue.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, subtitle, children }: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground">{title}</h2>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Split({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${accent ? "border-primary/40 bg-primary/5" : "border-border"}`}>
      <p className={`text-2xl font-heading ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
