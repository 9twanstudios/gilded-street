import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/hooks/use-products";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();

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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !orders?.length ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No orders yet</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.order_items?.length ?? 0}</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        order.status === "delivered" ? "bg-green-900/30 text-green-400" :
                        order.status === "processing" ? "bg-primary/10 text-primary" :
                        order.status === "pending" ? "bg-yellow-900/30 text-yellow-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
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
