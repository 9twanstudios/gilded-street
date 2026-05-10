import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, ScanLine, ShoppingCart, DollarSign, Share2 } from "lucide-react";
import { formatKES } from "@/hooks/use-wallet";

export default function AdminMarketing() {
  const { data: stats } = useQuery({
    queryKey: ["marketing-stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [scans, events, orders, referrals] = await Promise.all([
        supabase.from("qr_scans" as any).select("id", { count: "exact", head: true }).gte("scanned_at", since),
        supabase.from("events" as any).select("event_type").gte("created_at", since).limit(5000),
        supabase.from("orders").select("total, status, created_at").gte("created_at", since),
        supabase.from("referrals" as any).select("status, reward_amount"),
      ]);
      const evts = (events.data ?? []) as any[];
      const views = evts.filter((e) => e.event_type === "product_view").length;
      const carts = evts.filter((e) => e.event_type === "add_to_cart").length;
      const completed = (orders.data ?? []).filter((o) => o.status !== "cancelled");
      const revenue = completed.reduce((s, o) => s + (o.total || 0), 0);
      const refs = (referrals.data ?? []) as any[];
      const refRevenue = refs.reduce((s, r) => s + (r.reward_amount || 0), 0);
      const convRate = views > 0 ? ((completed.length / views) * 100).toFixed(2) : "0";
      const viralCoeff = refs.length > 0 ? (refs.filter((r) => r.status === "rewarded").length / refs.length).toFixed(2) : "0";
      return {
        scans: scans.count ?? 0,
        views, carts,
        orders: completed.length,
        revenue, convRate, viralCoeff,
        referrals: refs.length, refRevenue,
      };
    },
  });

  const cards = [
    { label: "QR Scans (30d)", value: stats?.scans ?? 0, icon: ScanLine },
    { label: "Product Views", value: stats?.views ?? 0, icon: TrendingUp },
    { label: "Add to Cart", value: stats?.carts ?? 0, icon: ShoppingCart },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingCart },
    { label: "Revenue (30d)", value: formatKES(stats?.revenue ?? 0), icon: DollarSign },
    { label: "Conversion %", value: `${stats?.convRate ?? 0}%`, icon: TrendingUp },
    { label: "Referrals", value: stats?.referrals ?? 0, icon: Users },
    { label: "Virality Coeff.", value: stats?.viralCoeff ?? 0, icon: Share2 },
  ];

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">Marketing Engine</h1>
      <p className="text-muted-foreground text-sm mb-6">Funnel · attribution · virality · revenue (last 30 days)</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="p-5 bg-card border border-border rounded-lg">
            <c.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-heading text-foreground">{c.value}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Funnel (30d)</h2>
        <div className="space-y-2">
          {[
            { label: "QR Scans", val: stats?.scans ?? 0 },
            { label: "Product Views", val: stats?.views ?? 0 },
            { label: "Add to Cart", val: stats?.carts ?? 0 },
            { label: "Orders", val: stats?.orders ?? 0 },
          ].map((row, i, arr) => {
            const max = Math.max(...arr.map((r) => r.val), 1);
            const pct = (row.val / max) * 100;
            return (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground uppercase">{row.label}</span>
                  <span className="text-foreground font-bold">{row.val}</span>
                </div>
                <div className="h-3 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-gold-light" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
