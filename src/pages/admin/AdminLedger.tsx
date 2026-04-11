import { useAllLedger, formatKES } from "@/hooks/use-wallet";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function AdminLedger() {
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: entries, isLoading } = useAllLedger({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Ledger</h1>

      <div className="flex gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        >
          <option value="">All Types</option>
          <option value="deposit">Deposit</option>
          <option value="purchase">Purchase</option>
          <option value="payout">Payout</option>
          <option value="fee">Fee</option>
          <option value="refund">Refund</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">User</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !entries?.length ? (
                <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">No entries</td></tr>
              ) : (
                entries.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {e.type === "deposit" || e.type === "refund" ? <ArrowDownLeft className="h-4 w-4 text-green-400" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                        <span className="text-xs font-display font-bold uppercase tracking-wider">{e.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{e.profiles?.full_name || e.profiles?.email || e.user_id.slice(0, 8)}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatKES(e.amount)}</td>
                    <td className="p-4"><span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      e.status === "completed" ? "bg-green-900/30 text-green-400" : e.status === "failed" ? "bg-red-900/30 text-red-400" : "bg-muted text-muted-foreground"
                    }`}>{e.status}</span></td>
                    <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{e.description}</td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
