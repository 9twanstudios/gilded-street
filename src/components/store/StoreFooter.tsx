import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import { SocialLinks } from "@/components/profile/SocialLinks";

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
              <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors text-sm">All Products</Link>
              <Link to="/shop?badge=NEW" className="text-muted-foreground hover:text-primary transition-colors text-sm">New Arrivals</Link>
              <Link to="/drops" className="text-muted-foreground hover:text-primary transition-colors text-sm">Drops</Link>
              <Link to="/journal" className="text-muted-foreground hover:text-primary transition-colors text-sm">Journal</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider text-sm text-foreground mb-4">Account</h4>
            <div className="flex flex-col gap-2">
              <Link to="/account/profile" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Account</Link>
              <Link to="/account/wallet" className="text-muted-foreground hover:text-primary transition-colors text-sm">Wallet</Link>
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
            <SocialLinks
              socials={{ instagram: "91fitz", tiktok: "91fitz", x: "91fitz", whatsapp: "254769254086" }}
              className="mb-4"
            />
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/about" className="text-muted-foreground hover:text-primary">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
              <Link to="/shipping" className="text-muted-foreground hover:text-primary">Shipping</Link>
              <Link to="/returns" className="text-muted-foreground hover:text-primary">Returns</Link>
              <Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
            </div>
            <p className="text-muted-foreground text-xs mt-3">Nairobi, Kenya 🇰🇪</p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} 91 Fitz. All rights reserved. Pan-African streetwear, forged in Nairobi.</p>
          <Link to="/admin" className="text-muted-foreground/60 hover:text-primary transition-colors text-[10px] font-display uppercase tracking-[0.2em]">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
