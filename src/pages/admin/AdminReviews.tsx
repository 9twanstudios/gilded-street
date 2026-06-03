import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false }).limit(200);
      if (error) throw error; return data || [];
    },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("reviews").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-reviews"] }); },
  });

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate user reviews. Deletes are permanent." />
      <DataTable rows={data as any[]} loading={isLoading} empty="No reviews."
        columns={[
          { key: "product", header: "Product", render: (r: any) => <span className="font-medium">{r.products?.name || r.product_id?.slice(0,8)}</span> },
          { key: "rating", header: "Rating", render: (r: any) => <span className="flex items-center gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</span> },
          { key: "comment", header: "Comment", render: (r: any) => <span className="text-muted-foreground line-clamp-2 max-w-md block">{r.comment}</span> },
          { key: "date", header: "Date", render: (r: any) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span> },
          { key: "actions", header: "", render: (r: any) => <Button size="sm" variant="outline" onClick={() => del.mutate(r.id)} className="border-destructive text-destructive"><Trash2 className="h-3 w-3" /></Button> },
        ]}
      />
    </div>
  );
}
