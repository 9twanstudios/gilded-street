import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Users, DollarSign, Zap, Target } from "lucide-react";
import { formatPrice } from "@/hooks/use-products";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts";

function dayKey(d: string) { return d.slice(0, 10); }

function useFunnel30() {
  return useQuery({
    queryKey: ["funnel-30"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [events, orders, profiles, refs] = await Promise.all([
        supabase.from("events" as any).select("event_type,user_id,session_id,created_at,page_path").gte("created_at", since),
        supabase.from("orders").select("id,total,user_id,attribution,created_at,status").gte("created_at", since),
        supabase.from("profiles").select("id,created_at").gte("created_at", since),
        supabase.from("referrals").select("status,created_at").gte("created_at", since),
      ]);

      const evs = (events.data ?? []) as any[];
      const ords = (orders.data ?? []) as any[];

      const byDay = new Map<string, { day: string; views: number; carts: number; orders: number; revenue: number }>();
      const dailyDAU = new Map<string, Set<string>>();

      evs.forEach((e) => {
        const k = dayKey(e.created_at);
        const row = byDay.get(k) ?? { day: k, views: 0, carts: 0, orders: 0, revenue: 0 };
        if (e.event_type === "product_view" || e.event_type === "drop_view") row.views++;
        if (e.event_type === "add_to_cart") row.carts++;
        byDay.set(k, row);
        const sid = e.user_id || e.session_id;
        if (sid) {
          const set = dailyDAU.get(k) ?? new Set();
          set.add(sid); dailyDAU.set(k, set);
        }
      });
      ords.forEach((o) => {
        if (o.status === "cancelled") return;
        const k = dayKey(o.created_at);
        const row = byDay.get(k) ?? { day: k, views: 0, carts: 0, orders: 0, revenue: 0 };
        row.orders++; row.revenue += o.total || 0;
        byDay.set(k, row);
      });
      const series = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));

      const totals = series.reduce((s, r) => ({
        views: s.views + r.views, carts: s.carts + r.carts, orders: s.orders + r.orders, revenue: s.revenue + r.revenue,
      }), { views: 0, carts: 0, orders: 0, revenue: 0 });

      const buyers = new Set(ords.filter((o) => o.status !== "cancelled").map((o) => o.user_id)).size;
      const dau = Math.round(Array.from(dailyDAU.values()).reduce((s, set) => s + set.size, 0) / Math.max(1, dailyDAU.size));
      const arpu = buyers > 0 ? totals.revenue / buyers : 0;

      // Revenue by source
      const sources = { direct: 0, referral: 0, qr: 0, utm: 0 };
      ords.forEach((o) => {
        if (o.status === "cancelled") return;
        const a = o.attribution || {};
        if (a.qr_slug) sources.qr += o.total;
        else if (a.ref) sources.referral += o.total;
        else if (a.utm_source) sources.utm += o.total;
        else sources.direct += o.total;
      });
      const sourceData = Object.entries(sources).map(([source, revenue]) => ({ source, revenue }));

      // Virality K = converted referrals / new signups
      const newUsers = profiles.data?.length ?? 0;
      const convertedRefs = refs.data?.filter((r: any) => r.status === "rewarded").length ?? 0;
      const k = newUsers > 0 ? convertedRefs / newUsers : 0;
      const conversion = totals.views > 0 ? (totals.orders / totals.views) * 100 : 0;
      const growthScore = k * arpu;

      return { series, totals, dau, arpu, k, growthScore, conversion, buyers, newUsers, sourceData };
    },
  });
}

const KPI = ({ icon: Icon, label, value, sub }: any) => (
  <div className="bg-card border border-border rounded-lg p-5">
    <div className="flex items-center gap-2 mb-2"><Icon className="h-5 w-5 text-primary" /><span className="text-xs uppercase tracking-wider text-muted-foreground font-display">{label}</span></div>
    <p className="text-3xl font-heading text-gold-gradient">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

export default function AdminAnalytics() {
  const { data: f, isLoading } = useFunnel30();

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">Analytics</h1>
      <p className="text-muted-foreground text-sm mb-8">LDX v14 — last 30 days</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KPI icon={Users} label="DAU" value={f?.dau ?? 0} />
        <KPI icon={DollarSign} label="ARPU" value={f ? formatPrice(Math.round(f.arpu)) : "—"} sub={`${f?.buyers ?? 0} buyers`} />
        <KPI icon={Target} label="Conversion" value={`${(f?.conversion ?? 0).toFixed(2)}%`} sub="Views→Order" />
        <KPI icon={TrendingUp} label="Virality K" value={(f?.k ?? 0).toFixed(2)} sub={`${f?.newUsers ?? 0} new users`} />
        <KPI icon={Zap} label="Growth Score" value={Math.round(f?.growthScore ?? 0)} sub="K × ARPU" />
        <KPI icon={Activity} label="Revenue" value={f ? formatPrice(f.totals.revenue) : "—"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">30-Day Funnel</h3>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={f?.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" name="Views" />
                <Line type="monotone" dataKey="carts" stroke="#a855f7" name="Carts" />
                <Line type="monotone" dataKey="orders" stroke="#22c55e" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Revenue by Source</h3>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={f?.sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} formatter={(v: any) => formatPrice(v as number)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-2">Funnel totals</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs uppercase">Views</p><p className="text-foreground font-display font-bold text-xl">{f?.totals.views ?? 0}</p></div>
          <div><p className="text-muted-foreground text-xs uppercase">Carts</p><p className="text-foreground font-display font-bold text-xl">{f?.totals.carts ?? 0}</p></div>
          <div><p className="text-muted-foreground text-xs uppercase">Orders</p><p className="text-foreground font-display font-bold text-xl">{f?.totals.orders ?? 0}</p></div>
          <div><p className="text-muted-foreground text-xs uppercase">Revenue</p><p className="text-primary font-display font-bold text-xl">{f ? formatPrice(f.totals.revenue) : "—"}</p></div>
        </div>
      </div>
    </div>
  );
}
