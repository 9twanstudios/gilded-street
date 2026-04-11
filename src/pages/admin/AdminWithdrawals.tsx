import { useAllWithdrawals, formatKES } from "@/hooks/use-wallet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminWithdrawals() {
  const { data: withdrawals, isLoading } = useAllWithdrawals();
  const queryClient = useQueryClient();

  const updateStatus = async (id: string, status: "approved" | "rejected", admin_note?: string) => {
    const { error } = await supabase
      .from("withdrawals")
      .update({ status, admin_note: admin_note || null, processed_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Withdrawal ${status}`);
    queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
  };

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Withdrawals</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">User</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !withdrawals?.length ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No withdrawals</td></tr>
              ) : (
                withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm text-foreground">{w.profiles?.full_name || w.profiles?.email || "—"}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatKES(w.amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {w.status === "approved" || w.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-400" /> :
                         w.status === "rejected" ? <XCircle className="h-4 w-4 text-destructive" /> :
                         <Clock className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-xs font-display font-bold uppercase tracking-wider">{w.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(w.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white text-xs">Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(w.id, "rejected")} className="border-destructive text-destructive text-xs">Reject</Button>
                        </div>
                      )}
                    </td>
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
