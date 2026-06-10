import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, useLedger, formatKES } from "@/hooks/use-wallet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, DollarSign, TrendingUp, Plus, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatPrice } from "@/hooks/use-products";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { EmptyState } from "@/components/store/EmptyState";
import SEO from "@/components/SEO";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const { data: ledger } = useLedger(user?.id);
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

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

  const { data: creatorProfile } = useQuery({
    queryKey: ["my-creator-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("creators").select("*").eq("user_id", user.id).maybeSingle();
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

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success/10 text-success";
      case "rejected": return "bg-destructive/20 text-destructive";
      default: return "bg-primary/10 text-primary";
    }
  };

  const openUpload = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  return (
    <div className="container py-8">
      <SEO title="Creator Dashboard | 91 Fitz" description="Manage your products and earnings." noindex />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-5xl text-gold-gradient">Creator Dashboard</h1>
          {creatorProfile && (
            <p className="text-muted-foreground text-sm mt-1 font-display">
              {creatorProfile.brand_name}
              {creatorProfile.verified && <span className="ml-2 text-primary">✓ Verified</span>}
            </p>
          )}
        </div>
        <Button onClick={openUpload} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Upload Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-5">
          <DollarSign className="h-5 w-5 text-primary mb-2" />
          <p className="text-primary font-heading text-3xl">{formatKES(wallet?.balance ?? 0)}</p>
          <p className="text-muted-foreground text-sm font-display uppercase tracking-wider mt-1">Wallet Balance</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-lg p-5">
          <TrendingUp className="h-5 w-5 text-success mb-2" />
          <p className="text-success font-heading text-3xl">{formatKES(totalEarnings)}</p>
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
        {!myProducts?.length ? (
          <EmptyState
            icon={Upload}
            title="No products yet"
            description="Upload your first product and start selling on 91 Fitz"
            actionLabel="Upload Product"
            onAction={openUpload}
          />
        ) : (
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
                {myProducts.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(p.price)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${statusColor(p.status || (p.approved ? "approved" : "pending"))}`}>
                        {p.status || (p.approved ? "Approved" : "Pending")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} creatorMode />
    </div>
  );
}
