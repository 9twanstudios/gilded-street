import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { useWishlist } from "@/hooks/use-wishlist";
import { useWallet, useLedger, formatKES } from "@/hooks/use-wallet";
import { formatPrice } from "@/hooks/use-products";
import { User, Package, Heart, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: orders } = useMyOrders(user?.id);
  const { data: wishlistItems } = useWishlist();
  const { data: wallet } = useWallet();
  const { data: ledger } = useLedger(user?.id);
  const [tab, setTab] = useState<"orders" | "wishlist" | "wallet">("orders");

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
          <div className="mt-3 bg-surface rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">Wallet</p>
            <p className="text-primary font-heading text-2xl">{formatKES(wallet?.balance ?? 0)}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setTab("orders")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${tab === "orders" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Package className="h-4 w-4" /> Orders
            </button>
            <button onClick={() => setTab("wishlist")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${tab === "wishlist" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Heart className="h-4 w-4" /> Wishlist {wishlistItems?.length ? `(${wishlistItems.length})` : ""}
            </button>
            <button onClick={() => setTab("wallet")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-display font-bold uppercase tracking-wider transition-all ${tab === "wallet" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Wallet className="h-4 w-4" /> Wallet
            </button>
          </div>

          {tab === "orders" && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Recent Orders</h2>
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
          )}

          {tab === "wishlist" && (
            <div>
              {wishlistItems && wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {wishlistItems.map((item: any, i: number) => (
                    item.products && <ProductCard key={item.id} product={item.products} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border p-6 text-center">
                  <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No saved items yet.</p>
                  <Button asChild className="mt-3 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark" size="sm">
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {tab === "wallet" && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Recent Transactions</h2>
                <Button asChild size="sm" variant="outline" className="border-primary text-primary">
                  <Link to="/wallet">View All</Link>
                </Button>
              </div>
              {ledger && ledger.length > 0 ? (
                <div className="space-y-3">
                  {ledger.slice(0, 5).map((entry: any) => (
                    <div key={entry.id} className="flex justify-between items-center border-b border-border/50 pb-3">
                      <div>
                        <p className="text-sm text-foreground font-medium capitalize">{entry.type}</p>
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-display font-bold ${entry.type === "deposit" || entry.type === "refund" ? "text-green-400" : "text-destructive"}`}>{formatKES(entry.amount)}</p>
                        <span className="text-xs text-muted-foreground">{entry.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No transactions yet.</p>
              )}
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-6">
            <Button variant="outline" onClick={signOut} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
