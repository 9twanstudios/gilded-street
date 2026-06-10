import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export default function AdminNotifyRequests() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notify-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notify_requests").select("*, products(name, in_stock)").order("created_at", { ascending: false });
      if (error) throw error; return data || [];
    },
  });
  const markNotified = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("notify_requests").update({ notified: true }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Marked notified"); qc.invalidateQueries({ queryKey: ["notify-requests"] }); },
  });

  return (
    <div>
      <PageHeader title="Restock Notifications" subtitle="Customers waiting on out-of-stock items." />
      <DataTable rows={data as any[]} loading={isLoading} empty="No requests."
        columns={[
          { key: "email", header: "Email", render: (r: any) => <span className="font-mono text-xs">{r.email}</span> },
          { key: "product", header: "Product", render: (r: any) => <span>{r.products?.name || r.product_id?.slice(0, 8)}</span> },
          { key: "stock", header: "In stock?", render: (r: any) => <span className={r.products?.in_stock ? "text-success" : "text-destructive"}>{r.products?.in_stock ? "Yes" : "No"}</span> },
          { key: "status", header: "Status", render: (r: any) => <span className="text-xs uppercase tracking-wider text-muted-foreground">{r.notified ? "notified" : "pending"}</span> },
          { key: "date", header: "Requested", render: (r: any) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span> },
          { key: "actions", header: "", render: (r: any) => !r.notified && <Button size="sm" onClick={() => markNotified.mutate(r.id)} className="bg-primary text-primary-foreground">Mark notified</Button> },
        ]}
      />
    </div>
  );
}
