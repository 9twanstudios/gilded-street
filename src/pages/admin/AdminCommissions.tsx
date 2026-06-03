import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { formatKES, formatDate } from "@/lib/format";

export default function AdminCommissions() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-commissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("commissions").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error; return data || [];
    },
  });
  const total = (data || []).reduce((s: number, c: any) => s + (c.platform_fee || 0), 0);
  const creatorTotal = (data || []).reduce((s: number, c: any) => s + (c.creator_earnings || 0), 0);

  return (
    <div>
      <PageHeader title="Commissions" subtitle={`Platform fees: ${formatKES(total)} · Creator earnings: ${formatKES(creatorTotal)}`} />
      <DataTable rows={data as any[]} loading={isLoading} empty="No commissions yet."
        columns={[
          { key: "order", header: "Order", render: (r: any) => <span className="font-mono text-xs">{r.order_id?.slice(0,8)}</span> },
          { key: "creator", header: "Creator", render: (r: any) => <span className="font-mono text-xs">{r.creator_id?.slice(0,8)}</span> },
          { key: "total", header: "Order total", render: (r: any) => <span>{formatKES(r.order_total)}</span> },
          { key: "creator_e", header: "Creator (90%)", render: (r: any) => <span className="text-green-400">{formatKES(r.creator_earnings)}</span> },
          { key: "platform", header: "Platform (10%)", render: (r: any) => <span className="text-primary">{formatKES(r.platform_fee)}</span> },
          { key: "date", header: "Date", render: (r: any) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span> },
        ]}
      />
    </div>
  );
}
