import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/hooks/use-products";
import { User, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: orders } = useMyOrders(user?.id);

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="font-heading text-5xl text-gold-gradient mb-8">My Account</h1>
        <div className="bg-card rounded-lg border border-border p-6 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">Guest User</h3>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your account</p>
          <Button asChild className="mt-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">My Account</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">{user.user_metadata?.full_name || user.email}</h3>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Recent Orders</h2>
            </div>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center border-b border-border/50 pb-3">
                    <div>
                      <p className="text-sm text-foreground font-medium">{order.id.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary font-display font-bold">{formatPrice(order.total)}</p>
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No orders yet. Start shopping!</p>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <Button
              variant="outline"
              onClick={signOut}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
