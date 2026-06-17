import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Sparkles, ImageOff, CheckCircle2, AlertCircle } from "lucide-react";

type Row = {
  id: string;
  name: string;
  image: string | null;
  fit_image: string | null;
  fit_slot: string | null;
  fit_status: "draft" | "processing" | "ready" | "failed";
  fit_readiness: number | null;
  dgr_code: string | null;
  mask_url: string | null;
  fit_metadata: any;
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  processing: "bg-yellow-500/15 text-yellow-500",
  ready: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
};

export default function AdminFitCheck() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-fitcheck-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,image,fit_image,fit_slot,fit_status,fit_readiness,dgr_code,mask_url,fit_metadata")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const rows = data ?? [];
  const filtered = useMemo(
    () => rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.dgr_code?.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  const stats = useMemo(() => {
    const total = rows.length || 1;
    const ready = rows.filter((r) => r.fit_status === "ready").length;
    const processing = rows.filter((r) => r.fit_status === "processing").length;
    const failed = rows.filter((r) => r.fit_status === "failed").length;
    const avg = Math.round(rows.reduce((s, r) => s + (r.fit_readiness ?? 0), 0) / total);
    return { total: rows.length, ready, processing, failed, avg };
  }, [rows]);

  const extract = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await supabase.functions.invoke("fitcheck-extract", {
        body: { product_ids: ids },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any, ids) => {
      const ok = (data?.results ?? []).filter((r: any) => r.ok).length;
      const fail = (data?.results ?? []).filter((r: any) => !r.ok).length;
      toast.success(`Processed ${ok} • ${fail} failed`);
      ids.forEach((id) => setBusy((b) => ({ ...b, [id]: false })));
      qc.invalidateQueries({ queryKey: ["admin-fitcheck-products"] });
    },
    onError: (e: any, ids) => {
      toast.error(e?.message ?? "Extraction failed");
      ids.forEach((id) => setBusy((b) => ({ ...b, [id]: false })));
    },
  });

  const runOne = (id: string) => {
    setBusy((b) => ({ ...b, [id]: true }));
    extract.mutate([id]);
  };

  const runBatch = () => {
    const ids = filtered.filter((r) => r.fit_status !== "ready").slice(0, 20).map((r) => r.id);
    if (ids.length === 0) {
      toast.info("Nothing to process");
      return;
    }
    ids.forEach((id) => setBusy((b) => ({ ...b, [id]: true })));
    extract.mutate(ids);
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-2">Failed to load products.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-gold-gradient">FitCheck Ops</h1>
          <p className="text-sm text-muted-foreground mt-1">Digital Garment Registry — readiness, pipeline, review queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or DGR" className="w-64" />
          <Button onClick={runBatch} disabled={extract.isPending}>
            <Sparkles className="h-4 w-4 mr-2" /> Process next 20
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total" value={stats.total} />
        <Stat label="Avg readiness" value={`${stats.avg}%`} accent />
        <Stat label="Ready" value={stats.ready} tone="success" />
        <Stat label="Processing" value={stats.processing} tone="warn" />
        <Stat label="Failed" value={stats.failed} tone="danger" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider">DGR</th>
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider">Slot</th>
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider">Readiness</th>
                <th className="px-4 py-3 font-display text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground"><Loader2 className="h-4 w-4 inline animate-spin mr-2" /> Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No products.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-background overflow-hidden shrink-0">
                        {r.fit_image || r.image ? (
                          <img src={r.fit_image || r.image!} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-muted-foreground"><ImageOff className="h-4 w-4" /></div>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[240px]">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.dgr_code ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.fit_slot ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_TONE[r.fit_status]} border-0`}>{r.fit_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${r.fit_readiness ?? 0}%` }} />
                      </div>
                      <span className="text-xs tabular-nums w-8">{r.fit_readiness ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" disabled={busy[r.id]} onClick={() => runOne(r.id)}>
                      {busy[r.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : r.fit_status === "ready" ? <CheckCircle2 className="h-3 w-3 text-success" /> : r.fit_status === "failed" ? <AlertCircle className="h-3 w-3 text-destructive" /> : <Sparkles className="h-3 w-3" />}
                      <span className="ml-1.5 text-xs">{r.fit_status === "ready" ? "Re-run" : "Process"}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The pipeline uses Lovable AI to classify garments and stamp metadata. Transparent cutout (mask_url) requires the dedicated <code>fits</code> storage bucket — create it once in the Supabase dashboard if missing.
      </p>
    </div>
  );
}

function Stat({ label, value, tone, accent }: { label: string; value: any; tone?: "success" | "warn" | "danger"; accent?: boolean }) {
  const cls = accent
    ? "text-gold-gradient"
    : tone === "success" ? "text-success"
    : tone === "warn" ? "text-yellow-500"
    : tone === "danger" ? "text-destructive"
    : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`text-3xl font-heading mt-1 ${cls}`}>{value}</p>
    </div>
  );
}
