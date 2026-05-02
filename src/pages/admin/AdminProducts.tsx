import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { logAdminAction } from "@/lib/admin-audit";

type TabFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch ALL products (admin RLS gives full access)
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = products?.filter((p: any) => {
    if (tab === "all") return true;
    const status = p.status || (p.approved ? "approved" : "pending");
    return status === tab;
  });

  const pendingCount = products?.filter((p: any) => (p.status || (p.approved ? "approved" : "pending")) === "pending").length ?? 0;

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("products").update({ status: "approved" as any, approved: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    logAdminAction("product.approved", id);
    toast.success("Product approved");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("products").update({ status: "rejected" as any, approved: false }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    logAdminAction("product.rejected", id);
    toast.success("Product rejected");
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) { toast.error(error.message); } else {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
    setDeleteTarget(null);
  };

  const openEdit = (product: any) => { setEditProduct(product); setFormOpen(true); };
  const openAdd = () => { setEditProduct(null); setFormOpen(true); };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-900/30 text-green-400";
      case "rejected": return "bg-destructive/20 text-destructive";
      default: return "bg-primary/10 text-primary";
    }
  };

  const tabs: { label: string; value: TabFilter; count?: number }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">Products</h1>
        <Button onClick={openAdd} className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-lg transition-colors ${
              tab === t.value ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !filtered?.length ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No products found</td></tr>
              ) : (
                filtered.map((product: any) => {
                  const status = product.status || (product.approved ? "approved" : "pending");
                  return (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{product.name}</span>
                            {product.creator_id && <p className="text-xs text-muted-foreground">Creator product</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                      <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(product.price)}</td>
                      <td className="p-4">
                        <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${statusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {status === "pending" && (
                            <>
                              <button onClick={() => handleApprove(product.id)}
                                className="p-1.5 rounded text-green-400 hover:bg-green-900/30 transition-colors" title="Approve">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleReject(product.id)}
                                className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors" title="Reject">
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => openEdit(product)}
                            className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editProduct} />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
