import { Link } from "react-router-dom";
import { Instagram, Twitter, MessageCircle, ExternalLink } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";

const ecosystemLinks = [
  { name: "91 Stay Woke", url: "https://91staywoke.vercel.app" },
  { name: "R3C Studios", url: "https://9twanstudios.vercel.app" },
  { name: "LionByte", url: "https://lionbyte.vercel.app" },
];

export function StoreFooter() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container py-12">
        {/* Newsletter above footer links */}
        <div className="max-w-lg mx-auto mb-10">
          <NewsletterSignup />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <span className="font-heading text-3xl text-gold-gradient">91FITZ</span>
            <p className="text-muted-foreground text-sm mt-2">Premium urban streetwear. Built in Kenya, worn worldwide.</p>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">All Products</Link>
              <Link to="/products?badge=NEW" className="text-muted-foreground hover:text-primary transition-colors text-sm">New Arrivals</Link>
              <Link to="/drops" className="text-muted-foreground hover:text-primary transition-colors text-sm">Drops</Link>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">Fashion Tips</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Account</Link>
              <Link to="/wallet" className="text-muted-foreground hover:text-primary transition-colors text-sm">Wallet</Link>
              <Link to="/checkout" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cart & Checkout</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Ecosystem</h4>
            <div className="flex flex-col gap-2">
              {ecosystemLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1">
                  {link.name} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
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
            <p className="text-muted-foreground text-xs">Nairobi, Kenya 🇰🇪</p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} 91 Fitz. All rights reserved. Kenyan streetwear brand.</p>
        </div>
      </div>
    </footer>
  );
}
