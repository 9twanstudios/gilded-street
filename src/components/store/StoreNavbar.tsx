import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, X, LogIn, Wallet, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "Drops", to: "/drops" },
  { label: "Stories", to: "/stories" },
  { label: "Blog", to: "/blog" },
];

export function StoreNavbar() {
  const { itemCount, setIsOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-3xl text-gold-gradient tracking-wider">91FITZ</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-display font-semibold uppercase tracking-widest transition-colors duration-200 hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-foreground"
              }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-display font-semibold uppercase tracking-widest text-neon/70 hover:text-neon transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search toggle */}
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground hover:text-primary transition-colors duration-200">
            <Search className="h-5 w-5" />
          </button>
          {user && (
            <Link to="/wallet" className="text-foreground hover:text-primary transition-colors duration-200 hidden sm:block" title="Wallet">
              <Wallet className="h-5 w-5" />
            </Link>
          )}
          {user ? (
            <Link to="/profile" className="text-foreground hover:text-primary transition-colors duration-200 hidden sm:block">
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <Link to="/login" className="text-foreground hover:text-primary transition-colors duration-200 hidden sm:block">
              <LogIn className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-foreground hover:text-primary transition-colors duration-200"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <form onSubmit={handleSearch} className="container py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface border-border text-foreground"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-display font-semibold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-display font-semibold uppercase tracking-widest text-neon/70 hover:text-neon transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
