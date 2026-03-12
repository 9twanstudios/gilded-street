import { mockOrders, formatPrice } from "@/lib/data";

export default function AdminOrders() {
  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Orders</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Order ID</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Items</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">{order.id}</td>
                  <td className="p-4 text-sm text-foreground">{order.customerName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.customerEmail}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
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
                  <td className="p-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
