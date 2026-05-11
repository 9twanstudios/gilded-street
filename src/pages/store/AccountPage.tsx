import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useWishlist } from "@/hooks/use-wishlist";
import { useWallet, formatKES } from "@/hooks/use-wallet";
import { User, Package, Heart, Wallet, ScanLine, LogOut, Gift } from "lucide-react";
import SEO from "@/components/SEO";
import { EmptyState } from "@/components/store/EmptyState";
import { formatPrice } from "@/hooks/use-products";
import InviteTab from "@/components/store/InviteTab";

type Tab = "overview" | "orders" | "profile" | "wishlist" | "wallet" | "qr" | "invite";

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const { data: orders } = useOrders();
  const { data: wishlist } = useWishlist();
  const { data: wallet } = useWallet();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "qr", label: "QR History", icon: ScanLine },
    { id: "invite", label: "Invite & Earn", icon: Gift },
  ];

  if (!user) return null;

  return (
    <div className="container py-10">
      <SEO title="My Account" noindex />
      <h1 className="font-heading text-4xl text-gold-gradient mb-2">Account</h1>
      <p className="text-muted-foreground text-sm mb-8">{user.email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-card border border-border rounded-lg p-2 h-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-display font-semibold transition-all ${
                tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 mt-2 border-t border-border text-sm font-display font-semibold text-destructive hover:bg-destructive/10 rounded">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="bg-card border border-border rounded-lg p-6 min-h-[400px]">
          {tab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Package} label="Orders" value={orders?.length ?? 0} />
              <StatCard icon={Heart} label="Wishlist" value={wishlist?.length ?? 0} />
              <StatCard icon={Wallet} label="Wallet" value={formatKES(wallet?.balance ?? 0)} />
            </div>
          )}
          {tab === "orders" && (
            !orders?.length ? (
              <EmptyState icon={Package} title="No orders yet" description="Your order history will appear here." actionLabel="Start Shopping" actionHref="/shop" />
            ) : (
              <div className="space-y-3">
                {orders.map((o: any) => (
                  <Link key={o.id} to="/account?tab=orders" className="block p-4 border border-border rounded hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-bold text-foreground text-sm">#{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-display font-bold">{formatPrice(o.total)}</p>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">{o.status}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
          {tab === "wishlist" && (
            !wishlist?.length ? (
              <EmptyState icon={Heart} title="Wishlist is empty" description="Save fits you love for later." actionLabel="Browse Drops" actionHref="/drops" />
            ) : (
              <p className="text-muted-foreground text-sm">{wishlist.length} saved item(s). View on the <Link to="/products" className="text-primary underline">shop page</Link>.</p>
            )
          )}
          {tab === "wallet" && (
            <div>
              <p className="text-muted-foreground text-sm mb-4">Available balance</p>
              <p className="font-heading text-5xl text-gold-gradient mb-6">{formatKES(wallet?.balance ?? 0)}</p>
              <Link to="/wallet" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-gold-dark">
                Manage Wallet
              </Link>
            </div>
          )}
          {tab === "qr" && <QRHistory userId={user.id} />}
          {tab === "invite" && <InviteTab />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="p-5 border border-border rounded-lg">
      <Icon className="h-5 w-5 text-primary mb-2" />
      <p className="text-2xl font-heading text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

function QRHistory({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ["my-qr-scans", userId],
    queryFn: async () => {
      const { data } = await supabase.from("qr_scans" as any).select("*, qr_campaigns(name, slug)").eq("user_id", userId).order("scanned_at", { ascending: false }).limit(50);
      return (data ?? []) as any[];
    },
  });
  if (!data?.length) return <EmptyState icon={ScanLine} title="No QR scans yet" description="Scan a 91 Fitz QR to unlock drops." />;
  return (
    <div className="space-y-2">
      {data.map((s: any) => (
        <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded">
          <div>
            <p className="text-sm font-display font-bold text-foreground">{s.qr_campaigns?.name ?? "Campaign"}</p>
            <p className="text-xs text-muted-foreground">/u/{s.qr_campaigns?.slug}</p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(s.scanned_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
