import { Link } from "react-router-dom";
import { Instagram, Twitter, MessageCircle } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-heading text-3xl text-gold-gradient">91FITZ</span>
            <p className="text-muted-foreground text-sm mt-2">Premium urban streetwear. Bold designs for the streets.</p>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">All Products</Link>
              <Link to="/products?badge=NEW" className="text-muted-foreground hover:text-primary transition-colors text-sm">New Arrivals</Link>
              <Link to="/products?badge=LIMITED" className="text-muted-foreground hover:text-primary transition-colors text-sm">Limited Drops</Link>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Fashion Tips</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Account</Link>
              <Link to="/checkout" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cart & Checkout</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href="https://wa.me/254769254086" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-green-500 transition-colors" aria-label="WhatsApp">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
            <p className="text-muted-foreground text-xs">Nairobi, Kenya</p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} 91Fitz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
