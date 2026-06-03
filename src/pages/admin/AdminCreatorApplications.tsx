import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function AdminCreatorApplications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["creator-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("creator_applications" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error; return data || [];
    },
  });
  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("creator_applications" as any).update({ status } as any).eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_admin_action" as any, { _action: `creator_app_${status}`, _target_type: "creator_application", _target_id: id, _meta: {} });
    },
    onSuccess: () => { toast.success("Decision saved"); qc.invalidateQueries({ queryKey: ["creator-applications"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Creator Applications" subtitle="Approve or reject creator-program submissions." />
      <DataTable
        rows={data as any[]}
        loading={isLoading}
        empty="No applications."
        columns={[
          { key: "brand", header: "Brand", render: (r: any) => <span className="font-medium">{r.brand_name}</span> },
          { key: "bio", header: "Bio", render: (r: any) => <span className="text-muted-foreground line-clamp-2 max-w-md block">{r.bio}</span> },
          { key: "status", header: "Status", render: (r: any) => <span className="text-xs font-display uppercase tracking-wider text-primary">{r.status}</span> },
          { key: "date", header: "Submitted", render: (r: any) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span> },
          { key: "actions", header: "", render: (r: any) => r.status === "pending" ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => decide.mutate({ id: r.id, status: "approved" })} className="bg-primary text-primary-foreground">Approve</Button>
              <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: r.id, status: "rejected" })} className="border-destructive text-destructive">Reject</Button>
            </div>
          ) : null },
        ]}
      />
    </div>
  );
}
