import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Search, Share2, DollarSign, ArrowRightLeft, Link2 } from "lucide-react";

export default function AdminGrowthSeo() {
  const [bySource, setBySource] = useState<Record<string, { orders: number; revenue: number }>>({});
  const [aeo, setAeo] = useState<{ ai_source: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const { data: orders } = await supabase
        .from("orders")
        .select("total, traffic_source, attribution, status, created_at")
        .gte("created_at", since)
        .in("status", ["delivered", "shipped", "processing"]);
      const grouped: Record<string, { orders: number; revenue: number }> = {};
      (orders || []).forEach((o: any) => {
        const src = o.traffic_source || "direct";
        if (!grouped[src]) grouped[src] = { orders: 0, revenue: 0 };
        grouped[src].orders += 1;
        grouped[src].revenue += o.total || 0;
      });
      setBySource(grouped);

      const { data: ev } = await supabase
        .from("events")
        .select("attribution, created_at")
        .gte("created_at", since)
        .limit(1000);
      const ai: Record<string, number> = {};
      (ev || []).forEach((e: any) => {
        const a = e.attribution || {};
        if (a.traffic_source === "ai_search" && a.ai_source) ai[a.ai_source] = (ai[a.ai_source] || 0) + 1;
      });
      setAeo(Object.entries(ai).map(([ai_source, count]) => ({ ai_source, count })).sort((a, b) => b.count - a.count));
    })();
  }, []);

  const icons: Record<string, JSX.Element> = {
    organic: <Search className="h-4 w-4" />, ai_search: <Bot className="h-4 w-4" />,
    social: <Share2 className="h-4 w-4" />, paid: <DollarSign className="h-4 w-4" />,
    direct: <ArrowRightLeft className="h-4 w-4" />, affiliate: <Link2 className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-4xl text-gold-gradient">Growth × SEO</h1>
        <p className="text-muted-foreground">Revenue and conversions per traffic source — last 30 days.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(bySource).map(([src, v]) => (
          <Card key={src}><CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              {icons[src] || <Search className="h-4 w-4" />} {src.replace("_", " ")}
            </div>
            <div className="text-2xl font-heading text-gold-gradient mt-2">KES {v.revenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{v.orders} orders</div>
          </CardContent></Card>
        ))}
        {Object.keys(bySource).length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">No completed orders with attribution yet.</p>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI-Search Referrals (AEO)</CardTitle></CardHeader>
        <CardContent>
          {aeo.length === 0 ? (
            <p className="text-sm text-muted-foreground">No AI-search visits captured yet — referrals from ChatGPT, Perplexity, Claude, Gemini will appear here.</p>
          ) : (
            <div className="space-y-2">
              {aeo.map((a) => (
                <div key={a.ai_source} className="flex items-center justify-between border-b border-border py-2">
                  <span className="capitalize text-foreground">{a.ai_source}</span>
                  <span className="text-primary font-display font-bold">{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
