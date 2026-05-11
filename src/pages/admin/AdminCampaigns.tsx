import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/admin-audit";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Trophy, Eye, ShoppingCart as CartIcon, DollarSign } from "lucide-react";
import { formatPrice } from "@/hooks/use-products";

interface Campaign {
  id: string; slug: string; name: string; variant: string; variant_of: string | null; active: boolean;
}

function useCampaignsWithStats() {
  return useQuery({
    queryKey: ["campaigns-ab"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [camps, scans, orders] = await Promise.all([
        supabase.from("qr_campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("qr_scans").select("campaign_id, scanned_at").gte("scanned_at", since),
        supabase.from("orders").select("id,total,status,attribution,created_at").gte("created_at", since),
      ]);
      const scansByCamp = new Map<string, number>();
      scans.data?.forEach((s: any) => scansByCamp.set(s.campaign_id, (scansByCamp.get(s.campaign_id) ?? 0) + 1));
      const list = (camps.data ?? []) as Campaign[];
      const ordersBySlug = new Map<string, { count: number; revenue: number }>();
      orders.data?.forEach((o: any) => {
        const slug = o.attribution?.qr_slug;
        if (!slug || o.status === "cancelled") return;
        const cur = ordersBySlug.get(slug) ?? { count: 0, revenue: 0 };
        cur.count++; cur.revenue += o.total || 0;
        ordersBySlug.set(slug, cur);
      });
      const enriched = list.map((c) => {
        const s = scansByCamp.get(c.id) ?? 0;
        const od = ordersBySlug.get(c.slug) ?? { count: 0, revenue: 0 };
        return {
          ...c,
          scans: s,
          orders: od.count,
          revenue: od.revenue,
          cvr: s > 0 ? (od.count / s) * 100 : 0,
          rpm: s > 0 ? (od.revenue / s) : 0,
        };
      });
      // Group by parent (variant_of) — parent campaign + its children
      const groups = new Map<string, typeof enriched>();
      enriched.forEach((c) => {
        const parent = c.variant_of ?? c.id;
        const arr = groups.get(parent) ?? [];
        arr.push(c);
        groups.set(parent, arr);
      });
      return Array.from(groups.values()).filter((g) => g.length > 1 || g[0]?.variant_of !== null);
    },
  });
}

export default function AdminCampaigns() {
  const { data: groups, isLoading } = useCampaignsWithStats();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  async function promote(winnerId: string, losers: string[]) {
    setBusy(winnerId);
    const { error } = await supabase.from("qr_campaigns").update({ active: false }).in("id", losers);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    logAdminAction("qr.created" as any, winnerId, { promoted: true, losers });
    toast.success("Winner promoted; variants deactivated");
    qc.invalidateQueries({ queryKey: ["campaigns-ab"] });
  }

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">A/B Campaigns</h1>
      <p className="text-muted-foreground text-sm mb-8">30-day variant performance. Promote the winner to retire its siblings.</p>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && !groups?.length && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FlaskConical className="h-10 w-10 text-primary mx-auto mb-3" />
          <p className="text-foreground font-display uppercase tracking-wider">No A/B groups yet</p>
          <p className="text-muted-foreground text-sm mt-2">Create QR variants under <a className="text-primary underline" href="/admin/qr">QR Campaigns</a> using the same Variant Of parent to compare them here.</p>
        </div>
      )}

      <div className="space-y-6">
        {groups?.map((variants, i) => {
          const winner = [...variants].sort((a, b) => b.cvr - a.cvr)[0];
          return (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold uppercase tracking-wider text-foreground">
                  {variants[0].name.split(" — ")[0]}
                </h2>
                <Button
                  size="sm"
                  disabled={busy === winner.id || variants.length < 2}
                  onClick={() => promote(winner.id, variants.filter((v) => v.id !== winner.id).map((v) => v.id))}
                  className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Promote {winner.variant}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {variants.map((v) => (
                  <div key={v.id} className={`p-4 rounded-lg border ${v.id === winner.id ? "border-primary/60 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-bold uppercase text-sm text-foreground">Variant {v.variant}</span>
                      <span className={`text-xs uppercase ${v.active ? "text-primary" : "text-muted-foreground"}`}>{v.active ? "Active" : "Paused"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Stat icon={Eye} label="Scans" value={v.scans} />
                      <Stat icon={CartIcon} label="Orders" value={v.orders} />
                      <Stat label="CVR" value={`${v.cvr.toFixed(2)}%`} accent />
                      <Stat icon={DollarSign} label="Revenue" value={formatPrice(v.revenue)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`p-2 rounded ${accent ? "bg-primary/10" : ""}`}>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <p className={`font-display font-bold text-base ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
