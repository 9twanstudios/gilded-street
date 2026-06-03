import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AUTOMATIONS = [
  { key: "auto.gsc", label: "Google Search Console sync", desc: "Daily — pulls impressions/clicks/CTR into seo_metrics." },
  { key: "auto.lowstock", label: "Low-stock alerts", desc: "Daily — flags products below threshold." },
  { key: "auto.drop_reminder", label: "Drop reminders", desc: "Hourly — emails notify_requests T-24h and T-1h." },
  { key: "auto.abandoned_cart", label: "Abandoned cart nudge", desc: "Every 2h — emails users with idle carts." },
  { key: "auto.commission_settlement", label: "Commission settlement", desc: "Nightly — marks ledger entries completed." },
];

export default function AdminAutomations() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings").select("*").in("key", AUTOMATIONS.map(a => a.key));
      if (error) throw error;
      const m: Record<string, string> = {}; (data || []).forEach((r: any) => { m[r.key] = r.value; });
      return m;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ key, on }: { key: string; on: boolean }) => {
      const { error } = await supabase.from("platform_settings").upsert({ key, value: on ? "true" : "false" } as any);
      if (error) throw error;
      await supabase.rpc("log_admin_action" as any, { _action: "automation_toggle", _target_type: "setting", _target_id: null, _meta: { key, on } });
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["automations"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Automations" subtitle="Toggle scheduled background jobs." />
      <div className="space-y-3 max-w-2xl">
        {AUTOMATIONS.map((a) => {
          const on = data?.[a.key] === "true";
          return (
            <div key={a.key} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-foreground uppercase tracking-wider text-sm">{a.label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{a.desc}</p>
              </div>
              <Switch checked={on} onCheckedChange={(v) => toggle.mutate({ key: a.key, on: v })} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-6 max-w-2xl">Toggles persist in <code>platform_settings</code>. Cron jobs check the flag before each run.</p>
    </div>
  );
}
