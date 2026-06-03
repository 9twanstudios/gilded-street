import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatDateTime } from "@/lib/format";

export default function AdminAuditLog() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs" as any).select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error; return data || [];
    },
  });
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Every admin action, immutable." />
      <DataTable rows={data as any[]} loading={isLoading} empty="No audit entries yet."
        columns={[
          { key: "when", header: "When", render: (r: any) => <span className="text-muted-foreground">{formatDateTime(r.created_at)}</span> },
          { key: "actor", header: "Actor", render: (r: any) => <span className="font-mono text-xs">{r.actor_id?.slice(0,8)}</span> },
          { key: "action", header: "Action", render: (r: any) => <span className="text-primary font-display uppercase tracking-wider text-xs">{r.action}</span> },
          { key: "target", header: "Target", render: (r: any) => <span className="text-muted-foreground text-xs">{r.target_type}/{r.target_id?.slice(0, 8)}</span> },
          { key: "meta", header: "Meta", render: (r: any) => <code className="text-xs text-muted-foreground">{Object.keys(r.meta || {}).length ? JSON.stringify(r.meta).slice(0, 80) : "—"}</code> },
        ]}
      />
    </div>
  );
}
