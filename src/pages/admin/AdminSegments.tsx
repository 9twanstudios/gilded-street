import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/admin-audit";
import { UsersRound, Download, Trash2, Plus } from "lucide-react";

interface SegmentFilter {
  city?: string;        // matches profile (future)
  has_orders?: boolean;
  min_orders?: number;
  ref_only?: boolean;   // only invitees that came via referral
  qr_only?: boolean;    // only buyers attributed to a qr campaign
  since_days?: number;
}

function useSegments() {
  return useQuery({
    queryKey: ["audience-segments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audience_segments" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

async function resolveSegment(filter: SegmentFilter): Promise<any[]> {
  const since = filter.since_days ? new Date(Date.now() - filter.since_days * 86400000).toISOString() : null;
  const { data: orders } = await supabase
    .from("orders")
    .select("user_id,total,attribution,created_at,status")
    .neq("status", "cancelled");
  const buckets = new Map<string, { count: number; spent: number; ref: boolean; qr: boolean; latest: string }>();
  orders?.forEach((o: any) => {
    if (since && o.created_at < since) return;
    if (!o.user_id) return;
    const cur = buckets.get(o.user_id) ?? { count: 0, spent: 0, ref: false, qr: false, latest: o.created_at };
    cur.count++; cur.spent += o.total || 0;
    if (o.attribution?.ref) cur.ref = true;
    if (o.attribution?.qr_slug) cur.qr = true;
    if (o.created_at > cur.latest) cur.latest = o.created_at;
    buckets.set(o.user_id, cur);
  });
  let userIds = Array.from(buckets.entries())
    .filter(([, v]) => {
      if (filter.has_orders && v.count < 1) return false;
      if (filter.min_orders && v.count < filter.min_orders) return false;
      if (filter.ref_only && !v.ref) return false;
      if (filter.qr_only && !v.qr) return false;
      return true;
    })
    .map(([id]) => id);
  if (!userIds.length) return [];
  const { data: profiles } = await supabase.from("profiles").select("id,email,full_name,phone").in("id", userIds);
  return profiles?.map((p: any) => ({ ...p, ...buckets.get(p.id) })) ?? [];
}

export default function AdminSegments() {
  const { user } = useAuth();
  const { data: segments, isLoading } = useSegments();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [filter, setFilter] = useState<SegmentFilter>({ has_orders: true, since_days: 30 });
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  async function save() {
    if (!name.trim()) { toast.error("Name required"); return; }
    const { error } = await supabase.from("audience_segments" as any).insert({
      name, description: desc, filter: filter as any, created_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    logAdminAction("settings.updated", null, { type: "segment.created", name });
    toast.success("Segment saved");
    setName(""); setDesc("");
    qc.invalidateQueries({ queryKey: ["audience-segments"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("audience_segments" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["audience-segments"] });
  }

  async function runPreview(seg: any) {
    setPreviewing(seg.id);
    const rows = await resolveSegment(seg.filter || {});
    setPreview(rows);
  }

  function exportCsv(rows: any[], name: string) {
    if (!rows.length) { toast.error("Empty segment"); return; }
    const headers = ["email","full_name","phone","count","spent"];
    const csv = [headers.join(",")].concat(
      rows.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g,'""')}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `segment-${name.replace(/\s+/g,"-")}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">Audience Segments</h1>
      <p className="text-muted-foreground text-sm mb-8">Save reusable customer filters. Export to CSV for outreach.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">New Segment</h2>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background mt-1" placeholder="High-intent referrers" />
            </div>
            <div>
              <Label className="text-xs uppercase">Description</Label>
              <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-background mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase">Min orders</Label>
                <Input type="number" min={0} value={filter.min_orders ?? 1} onChange={(e) => setFilter({ ...filter, min_orders: parseInt(e.target.value, 10) || 0 })} className="bg-background mt-1" />
              </div>
              <div>
                <Label className="text-xs uppercase">Window (days)</Label>
                <Input type="number" min={1} value={filter.since_days ?? 30} onChange={(e) => setFilter({ ...filter, since_days: parseInt(e.target.value, 10) || 30 })} className="bg-background mt-1" />
              </div>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={!!filter.ref_only} onChange={(e) => setFilter({ ...filter, ref_only: e.target.checked })} /> From referrals</label>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={!!filter.qr_only} onChange={(e) => setFilter({ ...filter, qr_only: e.target.checked })} /> From QR</label>
            </div>
            <Button onClick={save} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">Save Segment</Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <UsersRound className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Saved Segments</h2>
          </div>
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {!isLoading && !segments?.length && <p className="text-muted-foreground text-sm">No segments saved yet.</p>}
          <div className="space-y-2">
            {segments?.map((s) => (
              <div key={s.id} className="border border-border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold uppercase tracking-wider text-sm text-foreground">{s.name}</p>
                    {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => runPreview(s)}>Preview</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {previewing === s.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">{preview.length} matched users</p>
                    {preview.length > 0 && (
                      <Button size="sm" onClick={() => exportCsv(preview, s.name)} className="bg-primary text-primary-foreground font-display uppercase">
                        <Download className="h-3 w-3 mr-1" /> Export CSV
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
