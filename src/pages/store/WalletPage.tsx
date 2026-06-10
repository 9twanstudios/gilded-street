import { useAuth } from "@/hooks/use-auth";
import { useWallet, useLedger, useMyWithdrawals, useRequestWithdrawal, formatKES } from "@/hooks/use-wallet";
import { Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const statusIcon = (status: string) => {
  if (status === "completed" || status === "approved") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "failed" || status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
  return <Clock className="h-4 w-4 text-muted-foreground" />;
};

const typeColor = (type: string) => {
  if (type === "deposit") return "text-success";
  if (type === "purchase" || type === "fee") return "text-destructive";
  if (type === "payout") return "text-primary";
  return "text-muted-foreground";
};

export default function WalletPage() {
  const { user } = useAuth();
  const { data: wallet, isLoading } = useWallet();
  const { data: ledger } = useLedger(user?.id);
  const { data: withdrawals } = useMyWithdrawals();
  const withdrawMutation = useRequestWithdrawal();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="font-heading text-5xl text-gold-gradient mb-4">Wallet</h1>
        <p className="text-muted-foreground mb-4">Sign in to access your wallet.</p>
        <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const handleWithdraw = () => {
    const amt = Math.round(parseFloat(withdrawAmount) * 100);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (wallet && amt > wallet.balance) { toast.error("Insufficient balance"); return; }
    withdrawMutation.mutate({ amount: amt }, {
      onSuccess: () => { toast.success("Withdrawal requested!"); setWithdrawAmount(""); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="container py-8">
      <SEO title="Wallet | 91 Fitz" description="Manage your 91 Fitz wallet balance and withdrawals." noindex />
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Wallet</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Balance</p>
              <p className="font-heading text-3xl text-primary">{isLoading ? "..." : formatKES(wallet?.balance ?? 0)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{wallet?.currency || "KES"}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">Request Withdrawal</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Amount (KES)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-input border-border text-foreground"
            />
            <Button onClick={handleWithdraw} disabled={withdrawMutation.isPending} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark whitespace-nowrap">
              Withdraw
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-2">Pending Withdrawals</p>
          {withdrawals && withdrawals.filter((w: any) => w.status === "pending").length > 0 ? (
            <div className="space-y-2">
              {withdrawals.filter((w: any) => w.status === "pending").map((w: any) => (
                <div key={w.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</span>
                  <span className="text-primary font-display font-bold">{formatKES(w.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No pending withdrawals</p>
          )}
        </motion.div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {!ledger?.length ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No transactions yet</td></tr>
              ) : (
                ledger.map((entry: any) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {entry.type === "deposit" || entry.type === "refund" ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                        <span className={`text-xs font-display font-bold uppercase tracking-wider ${typeColor(entry.type)}`}>{entry.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-display font-bold text-foreground">{formatKES(entry.amount)}</td>
                    <td className="p-4"><div className="flex items-center gap-1">{statusIcon(entry.status)}<span className="text-xs text-muted-foreground">{entry.status}</span></div></td>
                    <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{entry.description}</td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</td>
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
