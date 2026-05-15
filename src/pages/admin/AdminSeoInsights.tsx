import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw, AlertTriangle, TrendingUp, Eye, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

interface SeoMetric {
  id: string; entity_type: string; entity_id: string | null; url: string | null;
  date: string; impressions: number; clicks: number; ctr: number; avg_position: number;
  top_query: string | null; indexed: boolean;
}
interface SeoAlert { id: string; type: string; severity: string; message: string; created_at: string; }

export default function AdminSeoInsights() {
  const [metrics, setMetrics] = useState<SeoMetric[]>([]);
  const [alerts, setAlerts] = useState<SeoAlert[]>([]);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    const [{ data: m }, { data: a }] = await Promise.all([
      supabase.from("seo_metrics").select("*").order("date", { ascending: false }).limit(200),
      supabase.from("seo_alerts").select("*").is("resolved_at", null).order("created_at", { ascending: false }).limit(20),
    ]);
    setMetrics((m as any) || []);
    setAlerts((a as any) || []);
  };

  useEffect(() => { load(); }, []);

  const syncGSC = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke("gsc-sync", { body: { days: 7 } });
      if (error) throw error;
      toast.success("Search Console sync triggered");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Sync failed — connect Google Search Console first");
    } finally { setSyncing(false); }
  };

  const totals = metrics.reduce(
    (acc, m) => ({ impressions: acc.impressions + m.impressions, clicks: acc.clicks + m.clicks }),
    { impressions: 0, clicks: 0 }
  );
  const avgCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const indexed = metrics.filter((m) => m.indexed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl text-gold-gradient">SEO Insights</h1>
          <p className="text-muted-foreground">Search visibility, ranking & crawl health.</p>
        </div>
        <Button onClick={syncGSC} disabled={syncing} className="bg-primary text-primary-foreground">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} /> Sync Search Console
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile icon={<Eye />} label="Impressions (30d)" value={totals.impressions.toLocaleString()} />
        <Tile icon={<MousePointerClick />} label="Clicks (30d)" value={totals.clicks.toLocaleString()} />
        <Tile icon={<TrendingUp />} label="Avg CTR" value={`${avgCtr.toFixed(2)}%`} />
        <Tile icon={<Globe />} label="Indexed Pages" value={indexed.toString()} />
      </div>

      {alerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="text-sm flex items-center justify-between border-b border-border py-2">
                <span className="text-foreground">{a.message}</span>
                <span className="text-xs text-muted-foreground uppercase">{a.severity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Top Pages</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr><th className="pb-2">URL</th><th>Imp.</th><th>Clicks</th><th>CTR</th><th>Pos.</th><th>Top Query</th></tr>
            </thead>
            <tbody>
              {metrics.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No GSC data yet — connect Google Search Console and run sync.</td></tr>}
              {metrics.slice(0, 50).map((m) => (
                <tr key={m.id} className="border-b border-border/40">
                  <td className="py-2 truncate max-w-xs text-foreground">{m.url || `${m.entity_type}/${m.entity_id}`}</td>
                  <td>{m.impressions}</td><td>{m.clicks}</td>
                  <td>{(m.ctr * 100).toFixed(1)}%</td>
                  <td>{m.avg_position.toFixed(1)}</td>
                  <td className="text-muted-foreground">{m.top_query || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase">{icon}<span>{label}</span></div>
      <div className="text-2xl font-heading text-gold-gradient mt-2">{value}</div>
    </CardContent></Card>
  );
}
