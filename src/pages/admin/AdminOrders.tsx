import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OrderDetailDialog } from "@/components/admin/OrderDetailDialog";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-900/30 text-yellow-400",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-blue-900/30 text-blue-400",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const queryClient = useQueryClient();
  const [detailOrder, setDetailOrder] = useState<any>(null);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  };

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Orders</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Order ID</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Items</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !orders?.length ? (
                <tr><td colSpan={6} className="p-4 text-muted-foreground text-center">No orders yet</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.order_items?.length ?? 0}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        onValueChange={(val) => updateStatus(order.id, val as OrderStatus)}
                      >
                        <SelectTrigger className={`w-[130px] h-8 text-xs font-display font-bold uppercase tracking-wider border-0 ${statusColors[order.status as OrderStatus] || "bg-muted text-muted-foreground"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs uppercase font-display">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailDialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
        order={detailOrder}
      />
    </div>
  );
}
