import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-heading text-3xl text-gold-gradient">91FITZ</span>
            <p className="text-muted-foreground text-sm mt-2">Premium urban streetwear. Bold designs for the streets.</p>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shop</Link>
              <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Account</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-xs">© 2026 91Fitz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
