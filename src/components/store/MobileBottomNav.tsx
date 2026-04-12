import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Search, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Search, label: "Shop", to: "/products" },
  { icon: ShoppingBag, label: "Cart", to: "/cart", isCart: true },
  { icon: User, label: "Account", to: "/profile" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount, setIsOpen } = useCart();
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => setIsOpen(true)}
                className="relative flex flex-col items-center gap-0.5 text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 right-0 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
                <span className="text-[10px] font-display font-semibold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          }

          const to = item.to === "/profile" && !user ? "/login" : item.to;

          return (
            <Link
              key={item.label}
              to={to}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-display font-semibold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
