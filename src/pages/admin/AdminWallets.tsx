import { useAllWallets, formatKES } from "@/hooks/use-wallet";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminWallets() {
  const { data: wallets, isLoading } = useAllWallets();

  const totalBalance = wallets?.reduce((s: number, w: any) => s + (w.balance || 0), 0) ?? 0;

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Wallets</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Total Platform Float</p>
          <p className="font-heading text-3xl text-primary">{formatKES(totalBalance)}</p>
        </div>
      </motion.div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">User</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Balance</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Currency</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !wallets?.length ? (
                <tr><td colSpan={4} className="p-4 text-muted-foreground text-center">No wallets</td></tr>
              ) : (
                wallets.map((w: any) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{w.profiles?.full_name || "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{w.profiles?.email || "—"}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatKES(w.balance)}</td>
                    <td className="p-4 text-sm text-muted-foreground">{w.currency}</td>
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
