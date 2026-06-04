import { Link, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Package, Users, ShoppingCart, Bell, ChevronLeft, ChevronRight,
  FolderOpen, FileText, Zap, Wallet, BookOpen, ArrowDownToLine, ScrollText, Settings,
  QrCode, Globe, BarChart3, Megaphone, FlaskConical, UsersRound, Star, BellRing,
  Coins, Share2, History, Bot, UserCheck, ChevronDown,
} from "lucide-react";

type Item = { label: string; to: string; icon: any };
type Group = { name: string; items: Item[] };

const GROUPS: Group[] = [
  { name: "Overview", items: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  ]},
  { name: "Catalog", items: [
    { label: "Products", to: "/admin/products", icon: Package },
    { label: "Categories", to: "/admin/categories", icon: FolderOpen },
    { label: "Drops", to: "/admin/drops", icon: Zap },
    { label: "Stories", to: "/admin/stories", icon: ScrollText },
    { label: "Blog", to: "/admin/blog", icon: FileText },
  ]},
  { name: "Commerce", items: [
    { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", to: "/admin/users", icon: Users },
    { label: "Reviews", to: "/admin/reviews", icon: Star },
    { label: "Notify Requests", to: "/admin/notify-requests", icon: BellRing },
  ]},
  { name: "Finance", items: [
    { label: "Wallets", to: "/admin/wallets", icon: Wallet },
    { label: "Ledger", to: "/admin/ledger", icon: BookOpen },
    { label: "Withdrawals", to: "/admin/withdrawals", icon: ArrowDownToLine },
    { label: "Commissions", to: "/admin/commissions", icon: Coins },
  ]},
  { name: "Growth", items: [
    { label: "Marketing", to: "/admin/marketing", icon: Megaphone },
    { label: "Campaigns", to: "/admin/campaigns", icon: FlaskConical },
    { label: "Segments", to: "/admin/segments", icon: UsersRound },
    { label: "QR", to: "/admin/qr", icon: QrCode },
    { label: "Referrals", to: "/admin/referrals", icon: Share2 },
    { label: "IG Embeds", to: "/admin/ig-embeds", icon: Megaphone },
  ]},
  { name: "SEO", items: [
    { label: "SEO Pages", to: "/admin/seo", icon: Globe },
    { label: "SEO Insights", to: "/admin/seo-insights", icon: BarChart3 },
    { label: "Growth × SEO", to: "/admin/growth-seo", icon: BarChart3 },
    { label: "SEO Content", to: "/admin/seo-content", icon: FileText },
  ]},
  { name: "System", items: [
    { label: "Creator Apps", to: "/admin/creator-applications", icon: UserCheck },
    { label: "Audit Log", to: "/admin/audit-log", icon: History },
    { label: "Automations", to: "/admin/automations", icon: Bot },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ]},
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.name, g.items.some((i) => location.pathname === i.to || location.pathname.startsWith(i.to + "/"))]))
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-surface border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && <span className="font-heading text-2xl text-gold-gradient">91FITZ</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-primary transition-colors">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {GROUPS.map((group) => {
            const isOpen = collapsed || open[group.name];
            return (
              <div key={group.name} className="mb-2">
                {!collapsed && (
                  <button onClick={() => setOpen({ ...open, [group.name]: !open[group.name] })}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                    {group.name}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  </button>
                )}
                {isOpen && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((link) => {
                      const active = location.pathname === link.to;
                      return (
                        <Link key={link.to} to={link.to} title={link.label}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200 ${
                            active ? "bg-primary/10 text-primary shadow-gold" : "text-muted-foreground hover:text-primary hover:bg-surface-elevated"
                          }`}>
                          <link.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{link.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link to="/" className={`text-xs text-muted-foreground hover:text-primary transition-colors ${collapsed ? "text-center block" : ""}`}>
            {collapsed ? "←" : "← Back to Store"}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-16 bg-surface/95 backdrop-blur border-b border-border flex items-center justify-between px-6">
          <h2 className="font-display font-bold text-foreground uppercase tracking-wider text-sm">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-primary transition-colors" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
