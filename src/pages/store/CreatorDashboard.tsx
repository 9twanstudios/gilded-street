import { useAuth } from "@/hooks/use-auth";
import { useWallet, useLedger, formatKES } from "@/hooks/use-wallet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatPrice } from "@/hooks/use-products";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const { data: ledger } = useLedger(user?.id);

  const { data: myProducts } = useQuery({
    queryKey: ["my-creator-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Sign in to access creator dashboard</p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const totalEarnings = ledger?.filter((e: any) => e.type === "deposit" && e.status === "completed").reduce((s: number, e: any) => s + e.amount, 0) ?? 0;

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Creator Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
          <DollarSign className="h-5 w-5 text-primary mb-2" />
          <p className="text-primary font-heading text-3xl">{formatKES(wallet?.balance ?? 0)}</p>
          <p className="text-muted-foreground text-sm font-display uppercase tracking-wider mt-1">Wallet Balance</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-5">
          <TrendingUp className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-green-400 font-heading text-3xl">{formatKES(totalEarnings)}</p>
          <p className="text-muted-foreground text-sm font-display uppercase tracking-wider mt-1">Total Earnings</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-lg p-5">
          <Package className="h-5 w-5 text-primary mb-2" />
          <p className="text-primary font-heading text-3xl">{myProducts?.length ?? 0}</p>
          <p className="text-muted-foreground text-sm font-display uppercase tracking-wider mt-1">Products</p>
        </motion.div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground">My Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {!myProducts?.length ? (
                <tr><td colSpan={3} className="p-4 text-muted-foreground text-center">No products yet</td></tr>
              ) : (
                myProducts.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{p.name}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(p.price)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        p.approved ? "bg-green-900/30 text-green-400" : "bg-primary/10 text-primary"
                      }`}>{p.approved ? "Approved" : "Pending"}</span>
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
