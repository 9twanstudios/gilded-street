import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart, Bell, ChevronLeft, ChevronRight, FolderOpen, FileText, Zap } from "lucide-react";
import { useState } from "react";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: FolderOpen },
  { label: "Drops", to: "/admin/drops", icon: Zap },
  { label: "Blog", to: "/admin/blog", icon: FileText },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Users", to: "/admin/users", icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-surface border-r border-border flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && <span className="font-heading text-2xl text-gold-gradient">91FITZ</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-primary transition-colors">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {adminLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-semibold transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary shadow-gold"
                    : "text-muted-foreground hover:text-primary hover:bg-surface-elevated"
                }`}
                title={link.label}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
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
            <button className="relative text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">3</span>
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
