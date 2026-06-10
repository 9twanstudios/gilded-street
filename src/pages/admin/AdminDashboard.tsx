import { DollarSign, Package, ShoppingCart, Users, TrendingUp, Wallet, ArrowDownToLine } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminStats } from "@/hooks/use-admin";
import { formatPrice } from "@/hooks/use-products";
import { formatKES } from "@/hooks/use-wallet";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    { label: "Revenue", value: formatPrice(stats?.revenue ?? 0), icon: DollarSign, change: "+12%" },
    { label: "Orders", value: (stats?.orderCount ?? 0).toString(), icon: ShoppingCart, change: "+5%" },
    { label: "Products", value: (stats?.productCount ?? 0).toString(), icon: Package, change: "+2" },
    { label: "Customers", value: (stats?.customerCount ?? 0).toString(), icon: Users, change: "+8" },
    { label: "Platform Float", value: formatKES(stats?.platformFloat ?? 0), icon: Wallet, change: "" },
    { label: "Platform Fees", value: formatKES(stats?.platformFees ?? 0), icon: TrendingUp, change: "" },
    { label: "Pending Payouts", value: (stats?.pendingWithdrawals ?? 0).toString(), icon: ArrowDownToLine, change: "" },
  ];

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-lg p-5 hover:shadow-gold transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-primary" />
              {stat.change && (
                <span className="text-xs text-success font-display font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {stat.change}
                </span>
              )}
            </div>
            <p className="text-primary font-heading text-3xl">{isLoading ? "..." : stat.value}</p>
            <p className="text-muted-foreground text-sm font-display uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Order ID</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : stats?.recentOrders.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-muted-foreground text-center">No orders yet</td></tr>
              ) : (
                stats?.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        order.status === "delivered" ? "bg-success/10 text-success" :
                        order.status === "processing" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {order.status}
                      </span>
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
