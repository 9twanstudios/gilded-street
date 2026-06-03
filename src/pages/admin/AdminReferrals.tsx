import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatTile } from "@/components/admin/StatTile";
import { formatDate, formatKES } from "@/lib/format";

export default function AdminReferrals() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("referrals").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data || [];
    },
  });
  const all = data || [];
  const converted = all.filter((r: any) => r.status === "converted").length;
  const pending = all.filter((r: any) => r.status === "pending").length;
  const rewardTotal = all.reduce((s: number, r: any) => s + (r.reward_amount || 0), 0);

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Referral chains, conversions, and reward payouts." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total" value={all.length} />
        <StatTile label="Converted" value={converted} />
        <StatTile label="Pending" value={pending} />
        <StatTile label="Rewards" value={formatKES(rewardTotal)} />
      </div>
      <DataTable rows={all as any[]} loading={isLoading} empty="No referrals yet."
        columns={[
          { key: "code", header: "Code", render: (r: any) => <code className="text-primary">{r.code}</code> },
          { key: "referrer", header: "Referrer", render: (r: any) => <span className="font-mono text-xs">{r.referrer_id?.slice(0,8)}</span> },
          { key: "invitee", header: "Invitee", render: (r: any) => <span className="font-mono text-xs">{r.invitee_id?.slice(0,8) || "—"}</span> },
          { key: "status", header: "Status", render: (r: any) => <span className="text-xs uppercase tracking-wider text-muted-foreground">{r.status}</span> },
          { key: "reward", header: "Reward", render: (r: any) => <span>{formatKES(r.reward_amount)}</span> },
          { key: "date", header: "Date", render: (r: any) => <span className="text-muted-foreground">{formatDate(r.created_at)}</span> },
        ]}
      />
    </div>
  );
}
