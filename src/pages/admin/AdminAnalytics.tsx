import { useEventsSummary, useRecentEvents } from "@/hooks/use-events";
import { Activity, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const { data: summary7 } = useEventsSummary(7);
  const { data: summary30 } = useEventsSummary(30);
  const { data: recent } = useRecentEvents(50);

  const eventLabel = (t: string) => t.replace(/_/g, " ");

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3"><Activity className="h-5 w-5 text-primary" /><h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground">Last 7 days</h3></div>
          <p className="text-4xl font-heading text-gold-gradient">{summary7?.total ?? 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total events</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="h-5 w-5 text-primary" /><h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground">Last 30 days</h3></div>
          <p className="text-4xl font-heading text-gold-gradient">{summary30?.total ?? 0}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total events</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 mb-8">
        <h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Events by type (7d)</h3>
        <div className="space-y-2">
          {Object.entries(summary7?.byType ?? {}).sort(([, a], [, b]) => (b as number) - (a as number)).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-foreground capitalize">{eventLabel(type)}</span>
              <span className="text-primary font-display font-bold">{count as number}</span>
            </div>
          ))}
          {!Object.keys(summary7?.byType ?? {}).length && <p className="text-muted-foreground text-sm">No events yet — start browsing the store to populate.</p>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-display font-bold uppercase tracking-wider text-sm text-foreground">Recent events</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border"><th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-display">When</th><th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-display">Event</th><th className="text-left p-3 text-xs uppercase tracking-wider text-muted-foreground font-display">Path</th></tr></thead>
            <tbody>
              {recent?.map((e: any) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="p-3 text-foreground font-display font-semibold capitalize">{eventLabel(e.event_type)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{e.page_path}</td>
                </tr>
              ))}
              {!recent?.length && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No events captured yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
